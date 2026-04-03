import { resolveUILang } from '@/lib/i18n'
import { getTranslations } from '@/lib/i18n/translations'
import { AdminPageTitle } from '@/components/app/admin/AdminPageTitle'
import { Badge } from '@/components/ui/badge'
import { Lightbulb } from 'lucide-react'

interface HelpPageProps {
  params: Promise<{ lang: string; clubId: string }>
}

export default async function HelpPage({ params }: HelpPageProps) {
  const { lang } = await params
  const uiLang = resolveUILang(lang)
  const t = getTranslations(uiLang)
  const h = t.club.admin.help

  return (
    <>
      <AdminPageTitle title={h.title} />
      <div className="w-full mx-auto max-w-2xl space-y-4">
        <div className="rounded-xl border p-4">
          <p className="text-muted-foreground">{h.intro}</p>
        </div>

        {/* Club Profile page */}
        <div className="rounded-xl border p-4 space-y-3">
          <h2 className="text-sm font-semibold">{h.pages.profile.title}</h2>
          <p className="text-sm text-muted-foreground">{h.pages.profile.description}</p>
          <ul className="space-y-1.5 text-sm text-muted-foreground">
            {Object.values(h.pages.profile.subsections).map((text, i) => (
              <li key={i} className="flex gap-2">
                <span className="shrink-0 text-muted-foreground/50">—</span>
                <span>{text}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Promote page */}
        <div className="rounded-xl border p-4 space-y-3">
          <h2 className="text-sm font-semibold">{h.pages.promote.title}</h2>
          <p className="text-sm text-muted-foreground">{h.pages.promote.description}</p>
          <ul className="space-y-1.5 text-sm text-muted-foreground">
            {h.pages.promote.items.map((item, i) => (
              <li key={i} className="flex gap-2">
                <span className="shrink-0 text-muted-foreground/50">—</span>
                <span>{item}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Settings page */}
        <div className="rounded-xl border p-4 space-y-3">
          <div className="flex items-center gap-2">
            <h2 className="text-sm font-semibold">{h.pages.settings.title}</h2>
            <Badge variant="secondary" className="text-[10px] px-1.5 py-0">
              {h.ownerOnly}
            </Badge>
          </div>
          <p className="text-sm text-muted-foreground">{h.pages.settings.description}</p>
          <ul className="space-y-1.5 text-sm text-muted-foreground">
            {Object.values(h.pages.settings.subsections).map((text, i) => (
              <li key={i} className="flex gap-2">
                <span className="shrink-0 text-muted-foreground/50">—</span>
                <span>{text}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Messages page */}
        <div className="rounded-xl border p-4 space-y-3">
          <h2 className="text-sm font-semibold">{h.pages.messages.title}</h2>
          <p className="text-sm text-muted-foreground">{h.pages.messages.description}</p>
          <ul className="space-y-1.5 text-sm text-muted-foreground">
            {h.pages.messages.items.map((item, i) => (
              <li key={i} className="flex gap-2">
                <span className="shrink-0 text-muted-foreground/50">—</span>
                <span>{item}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Tip */}
        <div className="rounded-xl border border-amber-500/30 bg-amber-500/5 p-4 flex gap-3">
          <Lightbulb className="h-5 w-5 shrink-0 text-amber-500 mt-0.5" />
          <div>
            <p className="text-sm font-medium">{h.tip}</p>
            <p className="text-sm text-muted-foreground">{h.tipContent}</p>
          </div>
        </div>
      </div>
    </>
  )
}
