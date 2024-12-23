import Image from 'next/image';
import Link from 'next/link';

import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Not found page',
  icons: ['/logo-blue.svg'],
};

export default function NotFound() {
  return (
    <div className="w-full h-screen flex flex-col items-center gap-4 mt-10">
      <Image src={'/404.jpg'} alt="error" width={600} height={600} priority />
      <div className="flex flex-col items-center gap-6 mt-2">
        <p className="text-lg text-grey">Page not found...</p>
        <Link href={'/'} className="text-2xl text-blue-600 uppercase font-medium hover:underline">
          Main Page
        </Link>
      </div>
    </div>
  );
}
