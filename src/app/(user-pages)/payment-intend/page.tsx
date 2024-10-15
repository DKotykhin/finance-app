import React from 'react';

import Link from 'next/link';

import { currentUser } from '@clerk/nextjs/server';
import { Button, Skeleton } from '@nextui-org/react';

import { PaymentSettings } from '../settings/PaymentSettings';

const PaymentIntendPage: React.FC<{ searchParams: { status: string } }> = async ({ searchParams }) => {
  const user = await currentUser();

  return (
    <div className="max-w-screen-2xl mx-auto">
      <div className="-mt-24 mb-12 ">
        {user ? (
          <div className="rounded-lg bg-white w-full border px-4 py-6 shadow-md">
            {searchParams?.status === 'cancel' && (
              <p className="text-red-500 text-center mb-4">Subscription has been canceled. Try again</p>
            )}
            <PaymentSettings userId={user.id} />
          </div>
        ) : (
          <div className="flex flex-col items-center md:flex-row md:justify-evenly gap-4 rounded-lg bg-white w-full border px-4 py-6 shadow-md">
            <Skeleton className="w-full max-w-sm h-48 rounded-lg bg-slate-100" />
            <Skeleton className="w-full max-w-sm h-48 rounded-lg bg-slate-100" />
            <Skeleton className="w-full max-w-sm h-48 rounded-lg bg-slate-100" />
          </div>
        )}
      </div>
      <div className="w-full flex justify-center mb-12">
        <Link href="/dashboard">
          <Button color="primary" variant="solid">
            Go to Dashboard
          </Button>
        </Link>
      </div>
    </div>
  );
};

export default PaymentIntendPage;
