import { CheckCircle2, Circle } from 'lucide-react'

interface FormSectionProps {
  title: string
  filled: boolean
  children: React.ReactNode
}

export function FormSection({ title, filled, children }: FormSectionProps) {
  return (
    <section className="rounded-lg border p-4 space-y-4">
      <div className="flex items-center gap-2">
        {filled ? (
          <CheckCircle2 className="h-4 w-4 shrink-0 text-green-500" />
        ) : (
          <Circle className="h-4 w-4 shrink-0 text-muted-foreground/40" />
        )}
        <h3 className="text-sm font-medium">{title}</h3>
      </div>
      {children}
    </section>
  )
}
