import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { SignInButton, SignedIn, SignedOut, UserButton } from '@clerk/nextjs';

import Navigation from './Navigation';

const Header: React.FC = () => {
  return (
    <header className="bg-gradient-to-b from-blue-700 to-blue-500 px-6 py-8 lg:px-14 pb-36">
      <div className="max-w-screen-2xl mx-auto">
        <div className="w-full flex items-center justify-between mb-14">
          <div className="flex items-center lg:gap-x-16">
            <Link href="/">
              <div className="items-center hidden lg:flex">
                <Image src="/logo.svg" width={40} height={40} alt="logo" />
                <p className="ml-2 text-white text-3xl font-semibold">Finance</p>
              </div>
            </Link>
            <Navigation />
          </div>
          <SignedOut>
            <SignInButton />
          </SignedOut>
          <SignedIn>
            <UserButton />
          </SignedIn>
        </div>
      </div>
    </header>
  );
};

export default Header;
