import type { Metadata } from "next";
import "./globals.css";
import { getLanguage } from "@/lib/i18n/get-language";
import { Toaster } from "@/components/ui/sonner";
import { ThemeProvider } from "@/components/providers/theme-provider";

export const metadata: Metadata = {
  title: {
    default: 'findyour.club — Find your club',
    template: '%s — findyour.club',
  },
  description: 'Find your club — the open directory for sports clubs. Browse by activity, region, and discover how to join.',
  metadataBase: new URL(process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'),
  icons: {
    icon: [
      { url: '/favicon.ico', sizes: 'any' },
      { url: '/favicon-16x16.png', sizes: '16x16', type: 'image/png' },
      { url: '/favicon-32x32.png', sizes: '32x32', type: 'image/png' },
    ],
    apple: '/apple-touch-icon.png',
  },
  manifest: '/site.webmanifest',
  openGraph: {
    siteName: 'findyour.club',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
  },
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const lang = await getLanguage()
  return (
    <html lang={lang} suppressHydrationWarning>
      <body className="antialiased" suppressHydrationWarning>
        <ThemeProvider>
          {children}
          <Toaster position="bottom-right" duration={3000} containerAriaLabel="Notifications" />
        </ThemeProvider>
      </body>
    </html>
  );
}
