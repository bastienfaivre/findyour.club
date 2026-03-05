import { LanguageSwitcher } from '@/components/app/LanguageSwitcher'

export default async function PlatformLayout({
  children,
  params,
}: {
  children: React.ReactNode
  params: Promise<{ lang: string }>
}) {
  const { lang } = await params

  return (
    <div>
      <header className="sticky top-0 z-10 border-b bg-background">
        <div className="mx-auto flex max-w-5xl items-center justify-between px-4 py-3">
          <span className="font-semibold">Clashware</span>
          <LanguageSwitcher currentLang={lang} />
        </div>
      </header>
      <main>{children}</main>
    </div>
  )
}
