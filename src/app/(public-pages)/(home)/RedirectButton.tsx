'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { Button, Skeleton } from '@nextui-org/react';
import { ClerkLoaded, ClerkLoading } from '@clerk/nextjs';

export const RedirectButton: React.FC<{ userId?: string }> = ({ userId }) => {
  const router = useRouter();

  return (
    <>
      <ClerkLoading>
        <div className="flex gap-4 mb-10">
          <Skeleton className="w-[200px] h-10 rounded-lg bg-slate-100"></Skeleton>
          <Skeleton className="w-[80px] h-10 rounded-lg bg-slate-100"></Skeleton>
        </div>
      </ClerkLoading>
      <ClerkLoaded>
        {userId ? (
          <Button color="secondary" className="mb-10 shadow-lg" onClick={() => router.push('/dashboard')}>
            Go to dashboard
          </Button>
        ) : (
          <div className="flex gap-4 items-center mb-10">
            <Button color="secondary" className="shadow-lg" onClick={() => router.push('/sign-up')}>
              Register as a new user
            </Button>
            <p className="text-white hidden md:flex">or</p>
            <Button color="default" variant="bordered" className="shadow-xl" onClick={() => router.push('/sign-in')}>
              <span className="text-white">Sign in</span>
            </Button>
          </div>
        )}
      </ClerkLoaded>
    </>
  );
};
