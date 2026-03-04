import { prisma } from '@/server/db'

/**
 * Returns all WebAuthn credentials for a user, in the shape expected by
 * SimpleWebAuthn's allowCredentials / excludeCredentials options.
 */
export async function getWebAuthnCredentialsByUser(userId: string) {
  return prisma.webauthnCredential.findMany({
    where: { userId },
    select: { credentialId: true, transports: true },
  })
}
