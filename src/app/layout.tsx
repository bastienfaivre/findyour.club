import type { Metadata } from "next";
import "./globals.css";
import { DevAuthPanel } from "@/components/app/auth/DevAuthPanel";
import { getLanguage } from "@/lib/i18n/get-language";

export const metadata: Metadata = {
  title: "Clashware",
  description: "Club management platform",
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const lang = await getLanguage()
  return (
    <html lang={lang}>
      <body className="antialiased" suppressHydrationWarning>
        {children}
        {process.env.NODE_ENV === 'development' && <DevAuthPanel />}
      </body>
    </html>
  );
}
