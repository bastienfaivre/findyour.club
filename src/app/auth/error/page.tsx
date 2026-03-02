interface AuthErrorPageProps {
  searchParams: Promise<{ error?: string }>
}

const SUPPORT_EMAIL = process.env.SUPPORT_EMAIL ?? 'support@clashware.io'

const ERROR_MESSAGES: Record<string, string> = {
  Configuration: 'There is a problem with the server configuration.',
  AccessDenied: 'Access denied. You do not have permission to sign in.',
  Verification: 'The sign-in link is no longer valid. It may have been used already or expired.',
  TokenInvalid: `This setup link is invalid or has already been used. Please contact support at ${SUPPORT_EMAIL} to receive a new one.`,
  TokenExpired: `This setup link has expired (links are valid for 1 hour). Please contact support at ${SUPPORT_EMAIL} to receive a new one.`,
  Default: 'An authentication error occurred. Please try again.',
}

export default async function AuthErrorPage({ searchParams }: AuthErrorPageProps) {
  const { error } = await searchParams
  const message = ERROR_MESSAGES[error ?? ''] ?? ERROR_MESSAGES.Default

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="max-w-md w-full text-center space-y-4">
        <h1 className="text-2xl font-semibold">Authentication Error</h1>
        <p className="text-muted-foreground">{message}</p>
        <a href="/auth/login" className="underline text-sm">
          Return to sign in
        </a>
      </div>
    </div>
  )
}
