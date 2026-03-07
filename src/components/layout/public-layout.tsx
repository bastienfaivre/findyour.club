import { PublicNavbar, type PublicNavbarProps } from '@/components/layout/public-navbar'
import { PublicFooter, type PublicFooterProps } from '@/components/layout/public-footer'

export interface PublicLayoutProps {
  children: React.ReactNode
  navbarProps: PublicNavbarProps
  footerProps: PublicFooterProps
  skipToContentLabel: string
}

export function PublicLayout({
  children,
  navbarProps,
  footerProps,
  skipToContentLabel,
}: PublicLayoutProps) {
  return (
    <div className="flex min-h-screen flex-col">
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-[60] focus:rounded-md focus:px-4 focus:py-2 focus:bg-background focus:text-foreground focus:ring-2 focus:ring-ring"
      >
        {skipToContentLabel}
      </a>
      <PublicNavbar {...navbarProps} />
      <main id="main-content" className="flex-1 px-6 lg:px-8">
        {children}
      </main>
      <PublicFooter {...footerProps} />
    </div>
  )
}
