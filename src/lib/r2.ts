import { S3Client, DeleteObjectCommand, PutObjectCommand, GetObjectCommand } from '@aws-sdk/client-s3'
import { getSignedUrl } from '@aws-sdk/s3-request-presigner'

export const ALLOWED_IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/svg+xml'] as const
export const MAX_IMAGE_SIZE_BYTES = 5 * 1024 * 1024 // 5 MB

function requireEnv(name: string): string {
  const value = process.env[name]
  if (!value) throw new Error(`${name} environment variable is required but not set`)
  return value
}

// Lazy-initialized S3 client — validated on first use, not at import time.
// This prevents tests that transitively import this module from crashing
// when R2 env vars are (correctly) absent in the test environment.
let _s3: S3Client | null = null
function getS3(): S3Client {
  if (!_s3) {
    _s3 = new S3Client({
      region: 'auto',
      endpoint: requireEnv('R2_ENDPOINT'),
      credentials: {
        accessKeyId: requireEnv('R2_ACCESS_KEY_ID'),
        secretAccessKey: requireEnv('R2_SECRET_ACCESS_KEY'),
      },
      forcePathStyle: true, // Required for MinIO local dev
    })
  }
  return _s3
}

function getBucket(): string {
  return requireEnv('R2_BUCKET_NAME')
}

/**
 * Generate a presigned PUT URL for direct client-side upload to R2/MinIO.
 * Key format: {clubId}/{cuid}.{ext} — prevents predictable URL enumeration.
 */
const ALLOWED_EXTENSIONS = new Set(['jpg', 'jpeg', 'png', 'webp', 'svg'])

export async function generateUploadUrl(clubId: string, fileExtension: string): Promise<{ uploadUrl: string; key: string }> {
  const ext = fileExtension.toLowerCase()
  if (!ALLOWED_EXTENSIONS.has(ext)) {
    throw new Error(`Invalid file extension: ${fileExtension}`)
  }

  const key = `${clubId}/${crypto.randomUUID()}.${ext}`

  const command = new PutObjectCommand({
    Bucket: getBucket(),
    Key: key,
    ContentType: extensionToMime(ext),
  })

  const uploadUrl = await getSignedUrl(getS3(), command, { expiresIn: 600 }) // 10 minutes

  return { uploadUrl, key }
}

/**
 * Delete an object from R2/MinIO by key.
 */
export async function deleteObject(key: string): Promise<void> {
  await getS3().send(new DeleteObjectCommand({ Bucket: getBucket(), Key: key }))
}

/**
 * Read an object from R2/MinIO and return its contents as a Buffer.
 */
export async function getObjectBuffer(key: string): Promise<Buffer> {
  const res = await getS3().send(new GetObjectCommand({ Bucket: getBucket(), Key: key }))
  const bytes = await res.Body!.transformToByteArray()
  return Buffer.from(bytes)
}

/**
 * Write a Buffer to R2/MinIO with the given content type.
 */
export async function putObject(key: string, body: Buffer, contentType: string): Promise<void> {
  await getS3().send(new PutObjectCommand({ Bucket: getBucket(), Key: key, Body: body, ContentType: contentType }))
}

/**
 * Returns the public URL for a stored object.
 */
export function getPublicUrl(key: string): string {
  return `${process.env.R2_PUBLIC_URL}/${key}`
}

/**
 * Extract the R2 object key from a public URL.
 */
export function extractR2Key(url: string): string {
  const prefix = process.env.R2_PUBLIC_URL ?? ''
  return url.replace(`${prefix}/`, '')
}

function extensionToMime(ext: string): string {
  const map: Record<string, string> = {
    jpg: 'image/jpeg',
    jpeg: 'image/jpeg',
    png: 'image/png',
    webp: 'image/webp',
    svg: 'image/svg+xml',
  }
  return map[ext.toLowerCase()] ?? 'application/octet-stream'
}
