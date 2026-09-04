import { DeleteObjectCommand, PutObjectCommand, S3Client } from '@aws-sdk/client-s3';

import { buildR2PublicUrl } from '@/lib/r2-public';

export type R2Folder = 'places' | 'persons' | 'location' | 'static';
export { buildR2PublicUrl, getR2PublicUrl } from '@/lib/r2-public';

function requireEnv(name: string): string {
  const value = process.env[name];
  if (!value) {
    throw new Error(`${name} is not set`);
  }
  return value;
}

let cachedClient: S3Client | null = null;

export function getR2Client(): S3Client {
  if (cachedClient) {
    return cachedClient;
  }

  const accountId = requireEnv('R2_ACCOUNT_ID');
  const accessKeyId = requireEnv('R2_ACCESS_KEY_ID');
  const secretAccessKey = requireEnv('R2_SECRET_ACCESS_KEY');
  const endpoint = process.env.R2_ENDPOINT || `https://${accountId}.r2.cloudflarestorage.com`;

  cachedClient = new S3Client({
    region: 'auto',
    endpoint,
    credentials: {
      accessKeyId,
      secretAccessKey,
    },
  });

  return cachedClient;
}

export function getR2Bucket(): string {
  return requireEnv('R2_BUCKET');
}

function extensionFromFileName(fileName: string, mimeType?: string): string {
  const fromName = fileName.split('.').pop()?.toLowerCase();
  if (fromName && fromName.length <= 5) {
    return fromName;
  }

  if (mimeType === 'image/jpeg') return 'jpg';
  if (mimeType === 'image/png') return 'png';
  if (mimeType === 'image/webp') return 'webp';
  if (mimeType === 'image/gif') return 'gif';
  return 'bin';
}

export function buildR2ObjectKey(folder: R2Folder, fileName: string, mimeType?: string): string {
  const ext = extensionFromFileName(fileName, mimeType);
  return `${folder}/${crypto.randomUUID()}.${ext}`;
}

export async function uploadBufferToR2(params: {
  key: string;
  body: Buffer;
  contentType: string;
}): Promise<{ r2_key: string; r2_url: string }> {
  const client = getR2Client();
  const bucket = getR2Bucket();

  await client.send(
    new PutObjectCommand({
      Bucket: bucket,
      Key: params.key,
      Body: params.body,
      ContentType: params.contentType,
    }),
  );

  return {
    r2_key: params.key,
    r2_url: buildR2PublicUrl(params.key),
  };
}

export async function deleteR2Object(key: string): Promise<void> {
  const client = getR2Client();
  const bucket = getR2Bucket();

  await client.send(
    new DeleteObjectCommand({
      Bucket: bucket,
      Key: key,
    }),
  );
}
