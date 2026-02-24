import { Router, Request, Response } from 'express';
import multer from 'multer';
import { z } from 'zod';
import { temporalService } from '../services/temporalService';
import { getStorageProvider } from '../providers/storage';
import { PDFDocument } from 'pdf-lib';
import sharp from 'sharp';
import { ApiResponse, EmbedResponse } from '../types';
import { asyncHandler } from '../middleware/errorHandler';

const router = Router();
const upload = multer({ limits: { fileSize: 50 * 1024 * 1024 } }); // 50 MB

const ImageEmbedSchema = z.object({
  imageUrl: z.string().url('Invalid image URL'),
  namespace: z.string().min(1, 'Namespace is required'),
  userId: z.string().min(1, 'User ID is required'),
  orgId: z.string().min(1, 'Organization ID is required'),
});

const PdfEmbedSchema = z.object({
  namespace: z.string().min(1, 'Namespace is required'),
  userId: z.string().min(1, 'User ID is required'),
  orgId: z.string().min(1, 'Organization ID is required'),
});

/**
 * POST /api/embed/image
 * Download an image from a URL, upload to object storage, then start embedding workflow.
 */
router.post('/image', asyncHandler(async (req: Request, res: Response) => {
  const validation = ImageEmbedSchema.safeParse(req.body);
  if (!validation.success) {
    return res.status(400).json({
      success: false,
      error: 'Validation failed',
      details: validation.error.issues,
    });
  }

  const { imageUrl, namespace, userId, orgId } = validation.data;
  const storage = getStorageProvider();

  const fetchRes = await fetch(imageUrl);
  if (!fetchRes.ok) {
    return res.status(400).json({ success: false, error: 'Failed to download image from URL' });
  }

  const imageBuffer = Buffer.from(await fetchRes.arrayBuffer());
  const contentType = fetchRes.headers.get('content-type') || 'image/jpeg';
  const ext = contentType.split('/')[1] || 'jpg';
  const fileName = `image-${Date.now()}.${ext}`;

  const { storageUrl, imageUrl: httpUrl, base64 } = await storage.uploadBuffer(
    imageBuffer,
    fileName,
    contentType,
    userId,
    namespace,
  );

  const workflowHandle = await temporalService.startImageEmbedWorkflow({
    storageUrl,
    imageUrl: httpUrl,
    base64,
    userId,
    namespace,
    orgId,
  });

  const responseData: ApiResponse<EmbedResponse> = {
    success: true,
    data: {
      workflowId: workflowHandle.workflowId,
      storageUrl,
      imageUrl: httpUrl,
      status: 'processing',
    },
    message: 'Image uploaded and embedding workflow started',
  };

  res.status(202).json(responseData);
}));

/**
 * POST /api/embed/pdf
 * Accept a PDF file, convert each page to a PNG, upload to object storage,
 * then start embedding workflow for all pages.
 */
router.post('/pdf', upload.single('pdf'), asyncHandler(async (req: Request, res: Response) => {
  const validation = PdfEmbedSchema.safeParse(req.body);
  if (!validation.success) {
    return res.status(400).json({
      success: false,
      error: 'Validation failed',
      details: validation.error.issues,
    });
  }

  const { namespace, userId, orgId } = validation.data;
  const pdfFile = req.file;
  if (!pdfFile) {
    return res.status(400).json({ success: false, error: 'PDF file is required' });
  }

  const storage = getStorageProvider();
  const pdfDoc = await PDFDocument.load(pdfFile.buffer);
  const numPages = pdfDoc.getPageCount();
  const pdfPages = [];

  for (let i = 0; i < numPages; i++) {
    const page = pdfDoc.getPage(i);
    const { width, height } = page.getSize();

    // TODO: replace with pdf2pic / pdf-poppler for actual page rendering
    const imageBuffer = await sharp({
      create: {
        width: Math.round(width),
        height: Math.round(height),
        channels: 3,
        background: { r: 255, g: 255, b: 255 },
      },
    })
      .png()
      .toBuffer();

    const fileName = `pdf-page-${i + 1}-${Date.now()}.png`;

    const { storageUrl, imageUrl: httpUrl, base64 } = await storage.uploadBuffer(
      imageBuffer,
      fileName,
      'image/png',
      userId,
      namespace,
    );

    pdfPages.push({ storageUrl, imageUrl: httpUrl, base64, userId, namespace, orgId, pageNumber: i + 1 });
  }

  const workflowHandle = await temporalService.startPdfEmbedWorkflow({ pages: pdfPages });

  const responseData: ApiResponse<EmbedResponse> = {
    success: true,
    data: {
      workflowId: workflowHandle.workflowId,
      totalPages: numPages,
      status: 'processing',
    },
    message: 'PDF processed and embedding workflow started',
  };

  res.status(202).json(responseData);
}));

/**
 * GET /api/embed/status/:workflowId
 * Poll the status of an embedding workflow.
 */
router.get('/status/:workflowId', asyncHandler(async (req: Request, res: Response) => {
  const { workflowId } = req.params;
  const status = await temporalService.getWorkflowStatus(workflowId!) as any;

  res.json({
    success: true,
    data: {
      workflowId,
      status: status?.status?.name,
      result:
        status?.status?.name === 'COMPLETED'
          ? await temporalService.getWorkflowResult(workflowId!)
          : null,
    },
    message: 'Workflow status retrieved successfully',
  });
}));

export { router as embedRoutes };
