'use client'
import { useState, useTransition } from 'react'
import Image from 'next/image'
import { Button } from '@/components/ui/button'
import { InputOTP, InputOTPGroup, InputOTPSlot } from '@/components/ui/input-otp'
import { Label } from '@/components/ui/label'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { enrollTotp } from '@/app/[lang]/(dashboard)/account/totp-setup/actions'

interface TotpSetupFormT {
  codeSetup: string
  verifying: string
  activate2fa: string
  copy: string
  copied: string
}

interface TotpSetupFormProps {
  qrDataUrl: string
  secret: string
  lang: string
  t: TotpSetupFormT
}

export function TotpSetupForm({ qrDataUrl, secret, lang, t }: TotpSetupFormProps) {
  const [code, setCode] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [copied, setCopied] = useState(false)
  const [isPending, startTransition] = useTransition()

  function copySecret() {
    navigator.clipboard.writeText(secret).then(() => {
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    })
  }

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setError(null)

    startTransition(async () => {
      const result = await enrollTotp({ code }, lang)
      if (result && !result.success) {
        setError(result.error)
        setCode('')
      }
    })
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col items-center gap-4">
        <Image
          src={qrDataUrl}
          alt="Scan this QR code with your authenticator app"
          width={200}
          height={200}
          className="rounded border"
          unoptimized
        />
        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          <code className="bg-muted px-2 py-1 rounded font-mono break-all">{secret}</code>
          <Button type="button" variant="ghost" size="sm" onClick={copySecret}>
            {copied ? t.copied : t.copy}
          </Button>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="flex flex-col items-center space-y-4">
        {error && (
          <Alert variant="destructive">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        <div className="flex flex-col items-center space-y-2">
          <Label>{t.codeSetup}</Label>
          <InputOTP
            maxLength={6}
            value={code}
            onChange={setCode}
            disabled={isPending}
          >
            <InputOTPGroup>
              <InputOTPSlot index={0} />
              <InputOTPSlot index={1} />
              <InputOTPSlot index={2} />
              <InputOTPSlot index={3} />
              <InputOTPSlot index={4} />
              <InputOTPSlot index={5} />
            </InputOTPGroup>
          </InputOTP>
        </div>

        <Button type="submit" className="mx-auto" disabled={isPending || code.length !== 6}>
          {isPending ? t.verifying : t.activate2fa}
        </Button>
      </form>
    </div>
  )
}
