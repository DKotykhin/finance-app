import type { Metadata, Viewport } from 'next';

export const mainViewport: Viewport = {
  themeColor: '#000000',
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
};

export const mainMetadata: Metadata = {
  title: 'Financial App',
  description: 'Provide your financial data in right way',
  authors: [
    {
      name: 'Dmytro Kotykhin',
      url: 'https://dmytro-kotykhin.pp.ua',
    },
  ],
  keywords: ['financial', 'money', 'app', 'transactions'],
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: 'https://finance-app-sandy-two.vercel.app/',
    images: ['/logo-blue.svg'],
    siteName: 'Financial App',
  },
  metadataBase: new URL('https://finance-app-sandy-two.vercel.app/'),
};

export const dashboardMetadata: Metadata = {
  title: 'Financial App | Dashboard',
  description: 'Dashboard with financial data',
};

export const transactionsMetadata: Metadata = {
  title: 'Financial App | Transactions',
  description: 'Transactions page with all transactions',
};

export const accountMetadata: Metadata = {
  title: 'Financial App | Accounts',
  description: 'Account page with transactions',
};

export const categoriesMetadata: Metadata = {
  title: 'Financial App | Categories',
  description: 'Categories page with transactions',
};

export const settingsMetadata: Metadata = {
  title: 'Financial App | Settings',
  description: 'Settings page with user settings',
};