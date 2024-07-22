import React from 'react';

import Image from 'next/image';
import Link from 'next/link';

export const Error: React.FC = () => {
  return (
    <div className="w-full h-screen flex flex-col items-center justify-center gap-4">
      <Image src={'/sorry.jpeg'} alt="error" width={250} height={250} priority />
      <div className="flex flex-col items-center gap-6 mt-10">
        <p className="text-lg text-grey">Page not found...</p>
        <Link href={'/'} className="text-2xl text-blue-600 uppercase font-medium hover:underline">
          Main Page
        </Link>
      </div>
    </div>
  );
};
