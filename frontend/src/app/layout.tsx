import type { Metadata, Viewport } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { Providers } from '@/components/providers/Providers';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';

const inter = Inter({ 
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-inter',
});

export const metadata: Metadata = {
  title: {
    default: 'Nawy - Find Your Perfect Apartment',
    template: '%s | Nawy',
  },
  description: 'Discover amazing apartments across the city with comprehensive search and filtering options.',
  keywords: ['apartments', 'real estate', 'housing', 'rent', 'buy', 'property'],
  authors: [{ name: 'Nawy' }],
  creator: 'Nawy',
  openGraph: {
    type: 'website',
    locale: 'en_US',
    siteName: 'Nawy',
    title: 'Nawy - Find Your Perfect Apartment',
    description: 'Discover amazing apartments with comprehensive search and filtering.',
  },
  robots: {
    index: true,
    follow: true,
  },
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  themeColor: '#2563eb',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={inter.variable}>
      <body className={inter.className}>
        <Providers>
          <div className="min-h-screen flex flex-col">
            <Header />
            <main className="flex-1" id="main-content" role="main">
              {children}
            </main>
            <Footer />
          </div>
        </Providers>
      </body>
    </html>
  );
}