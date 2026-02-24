export interface UploadResult {
  /** Protocol URL for backend use: gs://bucket/path or s3://bucket/key */
  storageUrl: string;
  /** Public HTTP URL for browser image rendering */
  imageUrl: string;
  /** base64 data URI passed to Cohere for embedding */
  base64: string;
}

export interface StorageProvider {
  uploadBuffer(
    buffer: Buffer,
    fileName: string,
    contentType: string,
    userId: string,
    namespace: string,
  ): Promise<UploadResult>;
}
