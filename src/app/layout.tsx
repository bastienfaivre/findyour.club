import type { Metadata } from "next";
import "./globals.css";
import { DevAuthPanel } from "@/components/app/auth/DevAuthPanel";

export const metadata: Metadata = {
  title: "Clashware",
  description: "Club management platform",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="antialiased" suppressHydrationWarning>
        {children}
        {process.env.NODE_ENV === 'development' && <DevAuthPanel />}
      </body>
    </html>
  );
}
