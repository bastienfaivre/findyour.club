import { S3Client, DeleteObjectCommand, PutObjectCommand } from '@aws-sdk/client-s3'
import { getSignedUrl } from '@aws-sdk/s3-request-presigner'

export const ALLOWED_IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/webp'] as const
export const MAX_IMAGE_SIZE_BYTES = 5 * 1024 * 1024 // 5 MB

const s3 = new S3Client({
  region: 'auto',
  endpoint: process.env.R2_ENDPOINT!,
  credentials: {
    accessKeyId: process.env.R2_ACCESS_KEY_ID!,
    secretAccessKey: process.env.R2_SECRET_ACCESS_KEY!,
  },
  forcePathStyle: true, // Required for MinIO local dev
})

const BUCKET = process.env.R2_BUCKET_NAME!

/**
 * Generate a presigned PUT URL for direct client-side upload to R2/MinIO.
 * Key format: {clubId}/{cuid}.{ext} — prevents predictable URL enumeration.
 */
export async function generateUploadUrl(clubId: string, fileExtension: string): Promise<{ uploadUrl: string; key: string }> {
  const key = `${clubId}/${crypto.randomUUID()}.${fileExtension}`

  const command = new PutObjectCommand({
    Bucket: BUCKET,
    Key: key,
    ContentType: extensionToMime(fileExtension),
  })

  const uploadUrl = await getSignedUrl(s3, command, { expiresIn: 600 }) // 10 minutes

  return { uploadUrl, key }
}

/**
 * Delete an object from R2/MinIO by key.
 */
export async function deleteObject(key: string): Promise<void> {
  await s3.send(new DeleteObjectCommand({ Bucket: BUCKET, Key: key }))
}

/**
 * Returns the public URL for a stored object.
 */
export function getPublicUrl(key: string): string {
  return `${process.env.R2_PUBLIC_URL}/${key}`
}

function extensionToMime(ext: string): string {
  const map: Record<string, string> = {
    jpg: 'image/jpeg',
    jpeg: 'image/jpeg',
    png: 'image/png',
    webp: 'image/webp',
  }
  return map[ext.toLowerCase()] ?? 'application/octet-stream'
}
