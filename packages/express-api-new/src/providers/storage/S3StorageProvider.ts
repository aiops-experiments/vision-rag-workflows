import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';
import { StorageProvider, UploadResult } from './StorageProvider';

export class S3StorageProvider implements StorageProvider {
  private s3: S3Client;
  private bucketName: string;
  private publicUrlBase: string;

  constructor() {
    const region = process.env['AWS_REGION'] || 'us-east-1';
    this.s3 = new S3Client({ region });
    this.bucketName = process.env['S3_BUCKET_NAME'] || '';
    // Override with S3_PUBLIC_URL_BASE if using CloudFront or a custom domain
    this.publicUrlBase =
      process.env['S3_PUBLIC_URL_BASE'] ||
      `https://${this.bucketName}.s3.${region}.amazonaws.com`;
  }

  async uploadBuffer(
    buffer: Buffer,
    fileName: string,
    contentType: string,
    userId: string,
    namespace: string,
  ): Promise<UploadResult> {
    const key = `${namespace}/${userId}/${Date.now()}-${fileName}`;

    await this.s3.send(
      new PutObjectCommand({
        Bucket: this.bucketName,
        Key: key,
        Body: buffer,
        ContentType: contentType,
      }),
    );

    const storageUrl = `s3://${this.bucketName}/${key}`;
    const imageUrl = `${this.publicUrlBase}/${key}`;
    const base64 = `data:${contentType};base64,${buffer.toString('base64')}`;

    return { storageUrl, imageUrl, base64 };
  }
}
