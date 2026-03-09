import QRCode from 'qrcode'
import { redirect } from 'next/navigation'
import { resolveUILang } from '@/lib/i18n'
import { getTranslations } from '@/lib/i18n/translations'
import { getAuthSession } from '@/server/auth'
import { prisma } from '@/server/db'
import { generateTotpSecret, generateTotpUri } from '@/lib/totp'
import { storePendingTotpSecret } from './actions'
import { TotpSetupForm } from '@/components/app/auth/TotpSetupForm'
import { AdminPageTitle } from '@/components/app/admin/AdminPageTitle'

interface TotpSetupPageProps {
  params: Promise<{ lang: string }>
}

export default async function TotpSetupPage({ params }: TotpSetupPageProps) {
  const { lang } = await params
  const t = getTranslations(resolveUILang(lang))
  const session = await getAuthSession()
  if (!session?.user) redirect(`/${lang}/auth/login`)
  if (session.user.totpEnabled && !session.user.totpVerified) redirect(`/${lang}/auth/totp`)

  const userId = session.user.id

  const dbUser = await prisma.user.findUnique({
    where: { id: userId },
    select: { pendingTotpSecret: true, email: true },
  })

  const email = dbUser?.email ?? session.user.email ?? userId
  let secret: string

  if (dbUser?.pendingTotpSecret) {
    secret = dbUser.pendingTotpSecret
  } else {
    secret = generateTotpSecret()
    await storePendingTotpSecret(userId, secret)
  }

  const uri = generateTotpUri(secret, email)
  const qrDataUrl = await QRCode.toDataURL(uri, { width: 200, margin: 2 })

  return (
    <div className="max-w-xl space-y-6">
      <AdminPageTitle title={t.auth.totpSetup} />
      <p className="text-muted-foreground text-sm">{t.auth.totpSetupSubtitle}</p>
      <TotpSetupForm
        qrDataUrl={qrDataUrl}
        secret={secret}
        t={{ codeSetup: t.auth.fields.codeSetup, verifying: t.auth.form.verifying, activate2fa: t.auth.form.activate2fa, copy: t.auth.form.copy, copied: t.auth.form.copied }}
      />
    </div>
  )
}
