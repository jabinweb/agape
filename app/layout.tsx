import './globals.css';
import type { Metadata } from 'next';
import { Inter, Playfair_Display } from 'next/font/google';
import { ThemeProvider } from '@/components/theme-provider';
import { Toaster } from '@/components/ui/sonner';
import { Header } from '@/components/header';
import { Footer } from '@/components/footer';
import Providers from '@/app/providers';
import { getStoreSettings } from '@/lib/settings';

const inter = Inter({ subsets: ['latin'], variable: '--font-inter' });
const playfair = Playfair_Display({ subsets: ['latin'], variable: '--font-playfair' });

export async function generateMetadata(): Promise<Metadata> {
  try {
    const settings = await getStoreSettings();
    return {
      title: `${settings.storeName} - Contemporary Art Gallery & Store`,
      description: `Discover contemporary paintings and artworks at ${settings.storeName}. Explore our collection of original paintings, mixed media, and artistic creations.`,
      keywords: 'art gallery, paintings, contemporary art, original artwork, artist store',
      openGraph: {
        title: `${settings.storeName} - Contemporary Art Gallery`,
        description: `Discover contemporary paintings and artworks at ${settings.storeName}`,
        type: 'website',
      },
    };
  } catch (error) {
    // Fallback metadata if settings can't be loaded
    return {
      title: 'ATELIER 7X - Contemporary Art Gallery & Store',
      description: 'Discover contemporary paintings and artworks at ATELIER 7X. Explore our collection of original paintings, mixed media, and artistic creations.',
      keywords: 'art gallery, paintings, contemporary art, original artwork, artist store',
      openGraph: {
        title: 'ATELIER 7X - Contemporary Art Gallery',
        description: 'Discover contemporary paintings and artworks',
        type: 'website',
      },
    };
  }
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${inter.variable} ${playfair.variable} font-sans antialiased`}>
        <ThemeProvider attribute="class" defaultTheme="light" enableSystem>
          <Providers>
            <Header />
            <div className="min-h-screen flex flex-col">
              {children}
            </div>
            <Footer />
            <Toaster />
          </Providers>
        </ThemeProvider>
      </body>
    </html>
  );
}