import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Sentinel',
  description: 'Track products, price history, and alerts across Egyptian online stores',
  icons: {
    icon: '/brand/sentinel-logo.png',
    shortcut: '/brand/sentinel-logo.png',
    apple: '/brand/sentinel-logo.png',
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="h-full antialiased">
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
