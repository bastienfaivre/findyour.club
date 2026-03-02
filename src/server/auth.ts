import NextAuth, { type NextAuthOptions } from 'next-auth'
import { PrismaAdapter } from '@auth/prisma-adapter'
import { cookies } from 'next/headers'
import { prisma } from '@/server/db'
import { decodeTotpVerifiedCookie } from '@/lib/setup-cookie'

/**
 * The next-auth session cookie name. Varies by environment because next-auth
 * applies the __Secure- prefix in production. Centralised here so all code that
 * reads/writes the cookie uses the same name.
 */
export const SESSION_COOKIE_NAME =
  process.env.NODE_ENV === 'production'
    ? '__Secure-next-auth.session-token'
    : 'next-auth.session-token'

export const authOptions: NextAuthOptions = {
  // Double 'as any': (1) $extends changes prisma TS type, (2) @auth/prisma-adapter v2
  // returns @auth/core Adapter type while next-auth v4 expects its own. Safe at runtime.
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  adapter: PrismaAdapter(prisma as any) as any,
  session: {
    strategy: 'database', // Server-authoritative database sessions
  },
  pages: {
    signIn: '/auth/login',
    error: '/auth/error',
  },
  // No providers: authentication is handled manually via loginWithCredentials() and
  // setupPassword() which create DB sessions directly. next-auth v4 CredentialsProvider
  // is incompatible with database session strategy (throws UnsupportedStrategyError).
  providers: [],
  callbacks: {
    async session({ session, user }) {
      // user comes from the database (database session strategy)
      const dbUser = await prisma.user.findUnique({
        where: { id: user.id },
        select: { role: true, totpEnabled: true },
      })
      session.user.id = user.id
      session.user.role = dbUser?.role ?? 'CLUB_ADMIN'
      session.user.totpEnabled = dbUser?.totpEnabled ?? false
      // Default: no TOTP challenge needed when totpEnabled is false
      session.user.totpVerified = !session.user.totpEnabled
      // Club context is null at login — populated by the club layout membership check
      session.user.clubId = null
      session.user.clubRole = null
      return session
    },
  },
}

/**
 * Get the authenticated session enriched with real-time totpVerified state.
 * Use this instead of getServerSession() in all auth-protected Server Components.
 * For users with totpEnabled=true, reads the encrypted totp_verified cookie set after TOTP challenge.
 */
export async function getAuthSession() {
  const { getServerSession } = await import('next-auth')
  const session = await getServerSession(authOptions)
  if (!session?.user) return null

  if (session.user.totpEnabled) {
    const cookieStore = await cookies()
    const totpVerifiedCookie = cookieStore.get('totp_verified')
    const verifiedUserId = totpVerifiedCookie
      ? decodeTotpVerifiedCookie(totpVerifiedCookie.value)
      : null
    session.user.totpVerified = verifiedUserId === session.user.id
  }

  return session
}

// Create the Next.js App Router handler (used by route.ts)
export const nextAuthHandler = NextAuth(authOptions)
