import React from 'react';
import { auth } from '@clerk/nextjs/server';

import { AccountCard } from './AccountCard';

const Accounts: React.FC = () => {
  const { userId }: { userId: string | null } = auth();

  return (
    <div className="max-w-screen-2xl mx-auto">
      <AccountCard userId={userId} />
    </div>
  );
};

export default Accounts;
