import type { ReactNode } from 'react';

import { Inter } from 'next/font/google';

import type { Metadata, Viewport } from 'next';

import { UIProvider } from '@/providers/UIProvider';
import { AuthProvider } from '@/providers/AuthProvider';
import { ToastProvider } from '@/providers/ToastProvider';
import { QueryProvider } from '@/providers/QueryProvider';
import { mainMetadata, mainViewport } from '@/metadata/metadata';

import './globals.css';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = mainMetadata;
export const viewport: Viewport = mainViewport;

export default function RootLayout({
  children,
}: Readonly<{
  children: ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning={true}>
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
