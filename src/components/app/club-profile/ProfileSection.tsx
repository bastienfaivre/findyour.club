import type { ReactNode } from 'react'

type ProfileSectionProps = {
  title: string
  children: ReactNode
  icon?: ReactNode
}

export function ProfileSection({ title, children, icon }: ProfileSectionProps) {
  if (!children) return null

  return (
    <section className="rounded-xl border p-4">
      <h2 className="mb-3 flex items-center gap-2 text-lg font-semibold">
        {icon}
        {title}
      </h2>
      <div>{children}</div>
    </section>
  )
}
