'use client'
import { useRef, useState, useTransition } from 'react'
import { Button } from '@/components/ui/button'
import { InputOTP, InputOTPGroup, InputOTPSlot } from '@/components/ui/input-otp'
import { Label } from '@/components/ui/label'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { verifyTotpChallenge } from '@/app/[lang]/(dashboard)/auth/totp/actions'

interface TotpFormT {
  codeTotp: string
  verifying: string
  verify: string
}

export function TotpForm({ t, lang }: { t: TotpFormT; lang: string }) {
  const [code, setCode] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [isPending, startTransition] = useTransition()
  const submittedRef = useRef(false)

  function submit(value: string) {
    if (value.length !== 6 || isPending || submittedRef.current) return
    submittedRef.current = true
    setError(null)

    startTransition(async () => {
      const result = await verifyTotpChallenge({ code: value }, lang)
      if (result && !result.success) {
        setError(result.error)
        setCode('')
      }
      submittedRef.current = false
    })
  }

  function handleChange(value: string) {
    setCode(value)
    if (value.length === 6) submit(value)
  }

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    submit(code)
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col items-center space-y-4">
      {error && (
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <div className="flex flex-col items-center space-y-2">
        <Label>{t.codeTotp}</Label>
        <InputOTP
          maxLength={6}
          value={code}
          onChange={handleChange}
          disabled={isPending}
          autoFocus
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
        {isPending ? t.verifying : t.verify}
      </Button>
    </form>
  )
}
