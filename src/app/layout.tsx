import { ReactNode } from 'react';
import { Inter } from 'next/font/google';
import type { Metadata } from 'next';

import { UIProvider } from '@/providers/UIProvider';
import { AuthProvider } from '@/providers/AuthProvider';
import { ToastProvider } from '@/providers/ToastProvider';
import { QueryProvider } from '@/providers/QueryProvider';

import './globals.css';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'Financial App',
  description: 'Provide your financial data in right way',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <UIProvider>
          <QueryProvider>
            <AuthProvider>{children}</AuthProvider>
          </QueryProvider>
        </UIProvider>
        <ToastProvider />
      </body>
    </html>
  );
}
