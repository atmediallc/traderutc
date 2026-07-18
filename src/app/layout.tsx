/**
 * Root Layout
 *
 * Server component that sets up:
 * - HTML metadata (SEO, title, description)
 * - Google Fonts (Inter for UI, JetBrains Mono for data)
 * - Global CSS
 * - Client providers (Time, Query)
 * - Dark theme by default
 */
import type { Metadata } from 'next';
import { Inter, JetBrains_Mono } from 'next/font/google';
import { TimeProvider } from '@/providers/TimeProvider';
import { QueryProvider } from '@/providers/QueryProvider';
import './globals.css';

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap',
});

const jetbrainsMono = JetBrains_Mono({
  subsets: ['latin'],
  variable: '--font-jetbrains-mono',
  display: 'swap',
});

export const metadata: Metadata = {
  title: 'TraderUTC Earth — Global Market Intelligence',
  description:
    'Professional 3D visualization of global financial markets. Real-time market status, UTC clocks, trading sessions, and economic calendar on a realistic Earth globe.',
  keywords: [
    'trading',
    'financial markets',
    'UTC',
    'global markets',
    'market hours',
    'trading sessions',
    'earth visualization',
    'bloomberg',
    'market intelligence',
  ],
  authors: [{ name: 'TraderUTC' }],
  openGraph: {
    title: 'TraderUTC Earth — Global Market Intelligence',
    description:
      'Professional 3D visualization of global financial markets on a realistic Earth globe.',
    type: 'website',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="en"
      className={`${inter.variable} ${jetbrainsMono.variable} dark`}
      suppressHydrationWarning
    >
      <body className="bg-black text-white antialiased overflow-hidden">
        <QueryProvider>
          <TimeProvider>
            {children}
          </TimeProvider>
        </QueryProvider>
      </body>
    </html>
  );
}
