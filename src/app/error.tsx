"use client";

import type { Metadata } from 'next';
import { ErrorBlock } from '@/components/ErrorBlock';

export const metadata: Metadata = {
  title: 'Error page',
  icons: ['/logo-blue.svg'],
};

export default function Error() {
  return <ErrorBlock />;
}