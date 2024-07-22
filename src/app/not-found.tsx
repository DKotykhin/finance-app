import { Error } from '@/components/Error';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Error page',
  icons: ['/logo-blue.svg'],
};

export default function NotFound() {
  return <Error />;
}
