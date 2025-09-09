'use client';

import { SessionProvider } from 'next-auth/react';
import { CartProvider } from '@/context/cart-context';
import { ThemeProvider } from '@/components/theme-provider';
import { SettingsProvider } from '@/context/settings-context';
import { StoreSettings } from '@/lib/settings';

interface ProvidersProps {
  children: React.ReactNode;
  initialSettings?: StoreSettings;
}

export default function Providers({ children, initialSettings }: ProvidersProps) {
  return (
    <SettingsProvider initialSettings={initialSettings}>
      <SessionProvider>
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
          <CartProvider>{children}</CartProvider>
        </ThemeProvider>
      </SessionProvider>
    </SettingsProvider>
  );
}
