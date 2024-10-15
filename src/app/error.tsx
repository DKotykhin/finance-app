'use client';

import Image from 'next/image';
import Link from 'next/link';

import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Error page',
  icons: ['/logo-blue.svg'],
};

export default function Error({ error }: { error: Error }) {
  return (
    <div className="w-full max-w-md h-screen flex flex-col items-center gap-4 mt-10">
      <Image src={'/error.png'} alt="error" width={600} height={450} priority />
      <div className="flex flex-col items-center gap-6 mt-2">
        {error.message ? (
          <p className="text-grey">{error.message}</p>
        ) : (
          <p className="text-lg text-grey">Something went wrong...</p>
        )}
        <Link href={'/'} className="text-2xl text-blue-600 uppercase font-medium hover:underline">
          Main Page
        </Link>
      </div>
    </div>
  );
}
