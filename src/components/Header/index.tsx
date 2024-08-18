import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { SignInButton, SignedIn, SignedOut, UserButton, ClerkLoaded, ClerkLoading } from '@clerk/nextjs';
import { Loader2 } from 'lucide-react';

import Navigation from './Navigation';
import { ThemeButton } from './ThemeButton';

const Header: React.FC = () => {
  return (
    <header className="bg-gradient-to-b from-blue-700 to-blue-500 dark:from-blue-950 dark:to-blue-600 px-4 py-8 lg:px-8 pb-48">
      <div className="max-w-screen-2xl mx-auto">
        <div className="w-full flex items-center justify-between mb-14">
          <div className="flex items-center lg:gap-x-16">
            <Link href="/">
              <div className="items-center hidden lg:flex">
                <Image src="/logo-white.svg" width={40} height={40} alt="logo" />
                <p className="ml-2 text-white text-3xl font-semibold">Finance</p>
              </div>
            </Link>
            <Navigation />
          </div>
          <div className='flex gap-8 items-center'>
            <ThemeButton />
            <ClerkLoading>
              <Loader2 className="text-slate-400 animate-spin" size={40} />
            </ClerkLoading>
            <ClerkLoaded>
              <SignedOut>
                <SignInButton />
              </SignedOut>
              <SignedIn>
                <UserButton />
              </SignedIn>
            </ClerkLoaded>
          </div>
        </div>
        <div className="space-y-2">
          <h2 className="text-2xl lg:text-3xl font-semibold text-white">Welcome to Finance</h2>
          <p className="text-blue-200">Manage your finances easily with Finance</p>
        </div>
      </div>
    </header>
  );
};

export default Header;
