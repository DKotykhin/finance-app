import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { SignInButton, SignedIn, SignedOut, UserButton, ClerkLoaded, ClerkLoading } from '@clerk/nextjs';
import { Loader2 } from 'lucide-react';

import Navigation from './Navigation';
import WelcomeMessage from './WelcomeMessage';

const Header: React.FC = () => {
  return (
    <header className="bg-gradient-to-b from-blue-700 to-blue-500 px-4 py-8 lg:px-8 pb-36">
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
        <WelcomeMessage />
      </div>
    </header>
  );
};

export default Header;
