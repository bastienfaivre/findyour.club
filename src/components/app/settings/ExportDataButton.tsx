'use client'

import { useState } from 'react'
import { Download, Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'

interface ExportDataButtonProps {
  exportUrl: string
  t: {
    exportData: string
    exportPreparing: string
    exportDoNotClose: string
    exportError: string
  }
}

export function ExportDataButton({ exportUrl, t }: ExportDataButtonProps) {
  const [exporting, setExporting] = useState(false)
  const [error, setError] = useState(false)

  async function handleExport() {
    setExporting(true)
    setError(false)

    try {
      const res = await fetch(exportUrl)
      if (!res.ok) throw new Error('Export failed')

      const blob = await res.blob()
      const disposition = res.headers.get('Content-Disposition')
      const match = disposition?.match(/filename="(.+)"/)
      const filename = match?.[1] ?? 'export.zip'

      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = filename
      document.body.appendChild(a)
      a.click()
      a.remove()
      URL.revokeObjectURL(url)
    } catch {
      setError(true)
    } finally {
      setExporting(false)
    }
  }

  return (
    <>
      <Button variant="outline" onClick={handleExport} disabled={exporting}>
        {exporting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Download className="h-4 w-4" />}
        {t.exportData}
      </Button>

      <AlertDialog open={exporting || error}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              {error ? t.exportError : t.exportPreparing}
            </AlertDialogTitle>
            {!error && (
              <AlertDialogDescription>{t.exportDoNotClose}</AlertDialogDescription>
            )}
          </AlertDialogHeader>

          {!error && (
            <div className="flex justify-center py-4">
              <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
          )}

          {error && (
            <AlertDialogFooter>
              <Button variant="outline" onClick={() => setError(false)}>OK</Button>
            </AlertDialogFooter>
          )}
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}
