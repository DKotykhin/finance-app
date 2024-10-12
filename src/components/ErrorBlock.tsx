import React from 'react';

import Image from 'next/image';
import Link from 'next/link';

export const ErrorBlock: React.FC = () => {
  return (
    <div className="w-full h-screen flex flex-col items-center gap-4 mt-10">
      <Image src={'/error.png'} alt="error" width={600} height={450} priority />
      <div className="flex flex-col items-center gap-6 mt-2">
        <p className="text-lg text-grey">Something went wrong...</p>
        <Link href={'/'} className="text-2xl text-blue-600 uppercase font-medium hover:underline">
          Main Page
        </Link>
      </div>
    </div>
  );
};
