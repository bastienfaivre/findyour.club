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
    title: t.layout.privacy,
    description: t.seo.privacyDescription,
    path: `/${lang}/privacy`,
    lang,
  })
}

export default async function PrivacyPage({ params }: Props) {
  const { lang } = await params
  const uiLang = resolveUILang(lang)
  const t = getTranslations(uiLang)
  const p = t.privacy

  return (
    <div className="py-8 sm:py-16 lg:py-24">
      <AdminPageTitle title={t.layout.privacy} />
      <div className="max-w-xl space-y-10">
        <div>
          <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">
            {p.title}
          </h1>
          <p className="mt-2 text-sm text-muted-foreground">{p.lastUpdated}</p>
          <p className="mt-6 text-lg leading-relaxed text-muted-foreground text-justify">
            {p.intro}
          </p>
        </div>

        <Section title={p.operator.title}>
          <p>{p.operator.content}</p>
        </Section>

        <Section title={p.dataCollected.title}>
          <Subsection title={p.dataCollected.visitors.title}>
            <BulletList items={p.dataCollected.visitors.items} />
          </Subsection>
          <Subsection title={p.dataCollected.applicants.title}>
            <BulletList items={p.dataCollected.applicants.items} />
          </Subsection>
          <Subsection title={p.dataCollected.clubAdmins.title}>
            <BulletList items={p.dataCollected.clubAdmins.items} />
          </Subsection>
        </Section>

        <Section title={p.usage.title}>
          <BulletList items={p.usage.items} />
        </Section>

        <Section title={p.security.title}>
          <BulletList items={p.security.items} />
        </Section>

        <Section title={p.thirdParty.title}>
          <p>{p.thirdParty.content}</p>
          <BulletList items={p.thirdParty.items} />
        </Section>

        <Section title={p.cookies.title}>
          <p>{p.cookies.content}</p>
        </Section>

        <Section title={p.retention.title}>
          <p>{p.retention.content}</p>
        </Section>

        <Section title={p.rights.title}>
          <p>{p.rights.content}</p>
          <BulletList items={p.rights.items} />
        </Section>

        <Section title={p.contact.title}>
          <p>{p.contact.content}</p>
        </Section>
      </div>
    </div>
  )
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="space-y-3">
      <h2 className="text-xl font-semibold">{title}</h2>
      <div className="space-y-3 text-muted-foreground leading-relaxed text-justify">{children}</div>
    </div>
  )
}

function Subsection({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="space-y-2">
      <h3 className="font-medium text-foreground">{title}</h3>
      {children}
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
