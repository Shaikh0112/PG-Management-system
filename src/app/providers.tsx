'use client';

import { useEffect } from 'react';
import { runSeed } from '@/lib/storage/seed';
import { ThemeProvider } from 'next-themes';

export function Providers({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    // Only run seed logic on client mount
    runSeed();
  }, []);

  return (
    <ThemeProvider attribute="class" defaultTheme="dark" enableSystem={false}>
      {children}
    </ThemeProvider>
  );
}
