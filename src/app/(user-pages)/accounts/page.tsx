import React from 'react';
import { auth } from '@clerk/nextjs/server';

import { AccountList } from './AccountList';
import { AddAccountCard } from './AddAccountCard';

const Accounts: React.FC = () => {
  const { userId }: { userId: string | null } = auth();

  return (
    <div className="max-w-screen-2xl mx-auto">
      <AddAccountCard />
      <AccountList userId={userId} />
    </div>
  );
};

export default Accounts;
