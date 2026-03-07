import type { ElementType } from '@/generated/prisma/client'

type PageElement = {
  id: string
  type: ElementType
  position: number
  data: unknown
}

const ELEMENT_LABELS: Record<ElementType, string> = {
  rich_text: 'Rich Text',
  image: 'Image',
  gallery: 'Gallery',
  calendar: 'Calendar',
  documents: 'Documents',
  contact: 'Contact',
}

export function ElementRenderer({ element }: { element: PageElement }) {
  const label = ELEMENT_LABELS[element.type]

  if (!label) return null

  return (
    <div className="rounded-lg border bg-card p-6 text-card-foreground">
      <div className="flex items-center gap-2 text-sm text-muted-foreground">
        <span className="font-medium">{label}</span>
      </div>
    </div>
  )
}
