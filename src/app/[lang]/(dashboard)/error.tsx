'use client'

import { useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card'

export default function DashboardError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    // TODO: send to error reporting service (e.g. Sentry)
  }, [error])

  return (
    <div className="flex flex-1 items-center justify-center py-16">
      <Card className="max-w-md text-center">
        <CardHeader>
          <CardTitle>Something went wrong</CardTitle>
          <CardDescription>
            An unexpected error occurred. Please try again.
          </CardDescription>
        </CardHeader>
        <CardFooter className="justify-center">
          <Button onClick={reset} variant="outline">
            Try again
          </Button>
        </CardFooter>
      </Card>
    </div>
  )
}
