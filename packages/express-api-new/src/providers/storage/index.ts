import { StorageProvider } from './StorageProvider';
import { GCSStorageProvider } from './GCSStorageProvider';
import { S3StorageProvider } from './S3StorageProvider';

export type StorageProviderType = 'gcs' | 's3';

let _storageProvider: StorageProvider | null = null;

/**
 * Returns a singleton storage provider selected by the STORAGE_PROVIDER env var.
 * Defaults to 'gcs'. Set STORAGE_PROVIDER=s3 to switch to AWS S3.
 */
export function getStorageProvider(): StorageProvider {
  if (_storageProvider) return _storageProvider;

  const type = (process.env['STORAGE_PROVIDER'] || 'gcs') as StorageProviderType;

  switch (type) {
    case 'gcs':
      _storageProvider = new GCSStorageProvider();
      break;
    case 's3':
      _storageProvider = new S3StorageProvider();
      break;
    default:
      throw new Error(
        `Unknown STORAGE_PROVIDER "${type}". Supported values: gcs, s3`,
      );
  }

  return _storageProvider;
}

export type { StorageProvider, UploadResult } from './StorageProvider';
