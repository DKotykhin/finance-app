import React from 'react';
import Image from 'next/image';
import { CircularProgress } from '@nextui-org/react';
import { SignIn, ClerkLoaded, ClerkLoading } from '@clerk/nextjs';

const SignInPage = () => {
  return (
    <div className="min-h-screen grid grid-cols-1 lg:grid-cols-2">
      <div className="flex justify-center items-center">
        <ClerkLoaded>
          <SignIn forceRedirectUrl={'/dashboard'} />
        </ClerkLoaded>
        <ClerkLoading>
          <div className="pt-10">
            <CircularProgress aria-label="Loading..." />
          </div>
        </ClerkLoading>
      </div>
      <div className="h-full bg-blue-600 hidden lg:flex items-center justify-center">
        <Image src="/logo-white.svg" width={100} height={100} alt="logo" />
        <p className='ml-4 text-white text-6xl font-bold'>Finance</p>
      </div>
    </div>
  );
};

export default SignInPage;
