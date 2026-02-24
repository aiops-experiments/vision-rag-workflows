import { Router, Request, Response } from 'express';
import { z } from 'zod';
import { temporalService } from '../services/temporalService';
import { ApiResponse, SearchResponse } from '../types';
import { asyncHandler } from '../middleware/errorHandler';

const router = Router();

const SearchSchema = z.object({
  query: z.string().min(1, 'Query is required'),
  namespace: z.string().min(1, 'Namespace is required'),
  userId: z.string().min(1, 'User ID is required'),
  orgId: z.string().min(1, 'Organization ID is required'),
  topK: z.number().int().min(1).max(100).default(5),
});

const SearchQuerySchema = z.object({
  query: z.string().min(1, 'Query is required'),
  namespace: z.string().min(1, 'Namespace is required'),
  userId: z.string().min(1, 'User ID is required'),
  orgId: z.string().min(1, 'Organization ID is required'),
  topK: z
    .string()
    .optional()
    .transform((val) => (val ? parseInt(val, 10) : 5)),
});

function buildResponse(
  searchResult: Awaited<ReturnType<typeof temporalService.startSearchWorkflow>>,
  namespace: string,
): ApiResponse<SearchResponse> {
  return {
    success: true,
    data: {
      results: searchResult.results.map((r) => ({
        id: r.id,
        score: r.score,
        imageUrl: r.imageUrl,
        metadata: {
          ...r.metadata,
          ...(r.storageUrl && { storageUrl: r.storageUrl }),
          ...(r.imageUrl && { imageUrl: r.imageUrl }),
        },
      })),
      query: searchResult.query,
      answer: searchResult.answer,
      namespace,
      totalResults: searchResult.totalResults,
    },
    message: `Found ${searchResult.totalResults} similar results`,
  };
}

/**
 * POST /api/search
 */
router.post('/', asyncHandler(async (req: Request, res: Response) => {
  const validation = SearchSchema.safeParse(req.body);
  if (!validation.success) {
    return res.status(400).json({
      success: false,
      error: 'Validation failed',
      details: validation.error.issues,
    });
  }

  const { query, namespace, userId, orgId, topK } = validation.data;
  const searchResult = await temporalService.startSearchWorkflow({
    query,
    namespace,
    userId,
    orgId,
    topK,
  });

  res.status(200).json(buildResponse(searchResult, namespace));
}));

/**
 * GET /api/search
 */
router.get('/', asyncHandler(async (req: Request, res: Response) => {
  const validation = SearchQuerySchema.safeParse(req.query);
  if (!validation.success) {
    return res.status(400).json({
      success: false,
      error: 'Validation failed',
      details: validation.error.issues,
    });
  }

  const { query, namespace, userId, orgId, topK } = validation.data;
  const searchResult = await temporalService.startSearchWorkflow({
    query,
    namespace,
    userId,
    orgId,
    topK,
  });

  res.status(200).json(buildResponse(searchResult, namespace));
}));

export { router as searchRoutes };
