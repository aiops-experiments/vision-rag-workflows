import { Storage } from '@google-cloud/storage';
import { StorageProvider, UploadResult } from './StorageProvider';

export class GCSStorageProvider implements StorageProvider {
  private storage: Storage;
  private bucketName: string;
  private publicUrlBase: string;

  constructor() {
    this.storage = new Storage();
    this.bucketName = process.env['GCS_BUCKET_NAME'] || 'vision-rag-bucket';
    // Override with GCS_PUBLIC_URL_BASE if your bucket is served from a CDN or custom domain
    this.publicUrlBase =
      process.env['GCS_PUBLIC_URL_BASE'] ||
      `https://storage.googleapis.com/${this.bucketName}`;
  }

  async uploadBuffer(
    buffer: Buffer,
    fileName: string,
    contentType: string,
    userId: string,
    namespace: string,
  ): Promise<UploadResult> {
    const filePath = `${namespace}/${userId}/${Date.now()}-${fileName}`;
    const bucket = this.storage.bucket(this.bucketName);
    const file = bucket.file(filePath);

    await file.save(buffer, { metadata: { contentType } });

    const storageUrl = `gs://${this.bucketName}/${filePath}`;
    const imageUrl = `${this.publicUrlBase}/${filePath}`;
    const base64 = `data:${contentType};base64,${buffer.toString('base64')}`;

    return { storageUrl, imageUrl, base64 };
  }
}
