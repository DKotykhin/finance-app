import type { Metadata } from 'next';
import { NotFoundBlock } from '@/components/NotFoundBlock';

export const metadata: Metadata = {
  title: 'Not found page',
  icons: ['/logo-blue.svg'],
};

export default function NotFound() {
  return <NotFoundBlock />;
}
