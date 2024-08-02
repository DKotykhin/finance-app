import { ReactNode } from 'react';
import type { Metadata } from 'next';

import Footer from '@/components/Footer';
import Header from '@/components/Header';

export const metadata: Metadata = {
  title: 'Financial App',
  description: 'Provide your financial data in right way',
};

export default function UserPagesLayout({
  children,
}: Readonly<{
  children: ReactNode;
}>) {
  return (
    <div className='flex flex-col h-screen'>
      <Header />
      <main className="px-4 lg:px-8 flex-grow">{children}</main>
      <Footer />
    </div>
  );
}
