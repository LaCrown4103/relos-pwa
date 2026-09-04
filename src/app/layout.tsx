import type { Metadata, Viewport } from 'next';
import './globals.css';
import { CoupleProvider } from '@/lib/CoupleContext';

export const metadata: Metadata = {
  title: 'RelOS - Relationship Operating System',
  description: 'Ein Betriebssystem für Paare - Kommunikation, Planung, Verbindung',
  manifest: '/manifest.json',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'default',
    title: 'RelOS',
  },
  formatDetection: {
    telephone: false,
  },
  icons: {
    icon: '/icon-192.png',
    apple: '/icon-192.png',
  },
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  viewportFit: 'cover',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="de">
      <head>
        <meta charSet="utf-8" />
        <meta name="theme-color" content="#e94b7d" />
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
        <meta name="apple-mobile-web-app-title" content="RelOS" />
        <link rel="icon" type="image/png" href="/icon-192.png" />
        <link rel="apple-touch-icon" href="/icon-192.png" />
      </head>
      <body>
        <CoupleProvider>
          {children}
        </CoupleProvider>
      </body>
    </html>
  );
}
