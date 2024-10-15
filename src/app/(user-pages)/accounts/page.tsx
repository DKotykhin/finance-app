import React from 'react';

import { auth } from '@clerk/nextjs/server';
import type { Metadata } from 'next';

import { accountMetadata } from '@/metadata/metadata';
import { AccountCard } from './AccountCard';

export const metadata: Metadata = accountMetadata;

const Accounts: React.FC = () => {
  const { userId }: { userId: string | null } = auth();

  return (
    <div className="max-w-screen-2xl mx-auto">
      <AccountCard userId={userId} />
    </div>
  );
};

export default Accounts;
