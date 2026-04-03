import type { Metadata } from 'next'
import { resolveUILang } from '@/lib/i18n'
import { getTranslations } from '@/lib/i18n/translations'
import { generatePlatformMetadata } from '@/components/app/seo/metadata'
import { AdminPageTitle } from '@/components/app/admin/AdminPageTitle'

type Props = {
  params: Promise<{ lang: string }>
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { lang } = await params
  const uiLang = resolveUILang(lang)
  const t = getTranslations(uiLang)
  return generatePlatformMetadata({
    title: t.layout.terms,
    description: t.seo.termsDescription,
    path: `/${lang}/terms`,
    lang,
  })
}

export default async function TermsPage({ params }: Props) {
  const { lang } = await params
  const uiLang = resolveUILang(lang)
  const t = getTranslations(uiLang)
  const s = t.terms

  return (
    <>
      <AdminPageTitle title={t.layout.terms} />
      <div className="w-full mx-auto max-w-2xl space-y-4">
        <div className="rounded-xl border p-4 space-y-3">
          <h1 className="text-2xl font-bold tracking-tight">
            {s.title}
          </h1>
          <p className="text-sm text-muted-foreground">{s.lastUpdated}</p>
          <p className="text-sm leading-relaxed text-muted-foreground text-justify">
            {s.intro}
          </p>
        </div>

        <Section title={s.acceptance.title}>
          <p>{s.acceptance.content}</p>
        </Section>

        <Section title={s.service.title}>
          <p>{s.service.content}</p>
        </Section>

        <Section title={s.accounts.title}>
          <p>{s.accounts.content}</p>
          <BulletList items={s.accounts.items} />
        </Section>

        <Section title={s.clubContent.title}>
          <p>{s.clubContent.content}</p>
          <BulletList items={s.clubContent.items} />
        </Section>

        <Section title={s.moderation.title}>
          <p>{s.moderation.content}</p>
        </Section>

        <Section title={s.intellectualProperty.title}>
          <p>{s.intellectualProperty.content}</p>
        </Section>

        <Section title={s.liability.title}>
          <p>{s.liability.content}</p>
        </Section>

        <Section title={s.termination.title}>
          <p>{s.termination.content}</p>
        </Section>

        <Section title={s.changes.title}>
          <p>{s.changes.content}</p>
        </Section>

        <Section title={s.contact.title}>
          <p>{s.contact.content}</p>
        </Section>
      </div>
    </>
  )
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="rounded-xl border p-4 space-y-3">
      <h2 className="text-lg font-semibold">{title}</h2>
      <div className="space-y-3 text-sm text-muted-foreground leading-relaxed text-justify">{children}</div>
    </div>
  )
}

function BulletList({ items }: { items: string[] }) {
  return (
    <ul className="list-disc space-y-1 pl-5">
      {items.map((item, i) => (
        <li key={i}>{item}</li>
      ))}
    </ul>
  )
}
