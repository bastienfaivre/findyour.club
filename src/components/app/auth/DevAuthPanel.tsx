// Temporary dev panel — remove before production
import Link from 'next/link'
import { getAuthSession } from '@/server/auth'

const SEEDED_EMAILS = [
  'admin@ski-club-valais.ch',
  'admin@football-club-lausanne.ch',
  'clashware.geology074@aleeas.com',
]

export async function DevAuthPanel() {
  const session = await getAuthSession()
  const user = session?.user

  return (
    <div className="fixed bottom-4 right-4 z-50 w-68 rounded-lg border border-zinc-700 bg-zinc-900 p-3 text-xs font-mono text-zinc-100 shadow-2xl" style={{ width: '17rem' }}>
      <p className="mb-2 text-[10px] font-bold uppercase tracking-widest text-zinc-500">
        Dev · Auth Panel
      </p>

      {user ? (
        <div className="mb-3 space-y-0.5 text-zinc-300">
          <p><span className="text-zinc-500">email </span>{user.email}</p>
          <p><span className="text-zinc-500">role </span>{user.role}</p>
          <p>
            <span className="text-zinc-500">totp </span>
            <span className={user.totpEnabled ? 'text-green-400' : 'text-amber-400'}>
              {user.totpEnabled ? 'enrolled' : 'not enrolled'}
            </span>
          </p>
          <p>
            <span className="text-zinc-500">verified </span>
            <span className={user.totpVerified ? 'text-green-400' : 'text-red-400'}>
              {String(user.totpVerified)}
            </span>
          </p>
        </div>
      ) : (
        <p className="mb-3 text-zinc-500">Not authenticated</p>
      )}

      <div className="space-y-1">
        {/* Auth actions */}
        {user ? (
          <>
            {/* Plain <a> — forces a full page load so the Server Component re-renders with cleared cookies */}
            {/* eslint-disable-next-line @next/next/no-html-link-for-pages */}
            <a href="/auth/logout" className="block rounded bg-red-800 px-2 py-1 text-center text-white hover:bg-red-700">
              Logout
            </a>
            <Link href="/auth/account" className="block rounded bg-zinc-700 px-2 py-1 text-center hover:bg-zinc-600">
              Account settings
            </Link>
            <Link href="/auth/totp-setup" className="block rounded bg-zinc-700 px-2 py-1 text-center hover:bg-zinc-600">
              {user.totpEnabled ? 'Re-enroll TOTP' : 'Enroll TOTP'}
            </Link>
            {user.totpEnabled && !user.totpVerified && (
              <Link href="/auth/totp" className="block rounded bg-zinc-700 px-2 py-1 text-center hover:bg-zinc-600">
                TOTP Challenge
              </Link>
            )}
          </>
        ) : (
          <Link href="/auth/login" className="block rounded bg-blue-700 px-2 py-1 text-center text-white hover:bg-blue-600">
            Login
          </Link>
        )}

        {/* Magic link — first-login flow testing */}
        <div className="mt-2 border-t border-zinc-700 pt-2 space-y-1">
          <p className="text-[10px] text-zinc-600 uppercase tracking-wider">Magic link (first-login)</p>
          {SEEDED_EMAILS.map(email => (
            <Link
              key={email}
              href={`/dev/magic-link?email=${encodeURIComponent(email)}`}
              className="block truncate rounded bg-zinc-800 px-2 py-1 text-center text-zinc-400 hover:bg-zinc-700"
              title={email}
            >
              {email.split('@')[0]}
            </Link>
          ))}
        </div>

        {/* Other dev pages */}
        <div className="mt-2 border-t border-zinc-700 pt-2 space-y-1">
          <p className="text-[10px] text-zinc-600 uppercase tracking-wider">Pages</p>
          <Link href="/auth/login" className="block rounded bg-zinc-800 px-2 py-1 text-center text-zinc-400 hover:bg-zinc-700">
            Login page
          </Link>
          <Link href="/auth/setup" className="block rounded bg-zinc-800 px-2 py-1 text-center text-zinc-400 hover:bg-zinc-700">
            Password setup
          </Link>
          <Link href="/auth/error" className="block rounded bg-zinc-800 px-2 py-1 text-center text-zinc-400 hover:bg-zinc-700">
            Error page
          </Link>
          <Link href="/my-clubs" className="block rounded bg-zinc-800 px-2 py-1 text-center text-zinc-400 hover:bg-zinc-700">
            My clubs
          </Link>
        </div>
      </div>
    </div>
  )
}
