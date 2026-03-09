import type { Metadata } from "next";
import "./globals.css";
import { getLanguage } from "@/lib/i18n/get-language";
import { Toaster } from "@/components/ui/sonner";
import { ThemeProvider } from "@/components/providers/theme-provider";

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
    <html lang={lang} suppressHydrationWarning>
      <body className="antialiased" suppressHydrationWarning>
        <ThemeProvider>
          {children}
          <Toaster position="bottom-right" duration={3000} />
        </ThemeProvider>
      </body>
    </html>
  );
}
