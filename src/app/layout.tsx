import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { Providers } from './providers';

const inter = Inter({ subsets: ['latin'], variable: '--font-inter' });

export const metadata: Metadata = {
  title: 'SmartPG — Hostel Operating System',
  description: 'A complete multi-tenant hostel management SaaS platform.',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body suppressHydrationWarning className={`${inter.variable} font-sans antialiased min-h-screen`}>
        <Providers>
          {children}
        </Providers>
      </body>
    </html>
  );
}
