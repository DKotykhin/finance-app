import type { Metadata } from 'next';
import { Inter } from 'next/font/google';

import { UIProvider } from '@/providers/UIProvider';
import { AuthProvider } from '@/providers/AuthProvider';

import './globals.css';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'Financial App',
  description: 'Provide your financial data in right way',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <UIProvider>
          <AuthProvider>{children}</AuthProvider>
        </UIProvider>
      </body>
    </html>
  );
}
