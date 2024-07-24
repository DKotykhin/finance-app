import React from 'react';
import { Card, CardHeader } from '@nextui-org/react';
import { auth } from '@clerk/nextjs/server';

import { AccountModal } from './AccountModal';
import { AccountList } from './AccountList';

const Accounts: React.FC = () => {
  const { userId }: { userId: string | null } = auth();

  return (
    <div className="max-w-screen-2xl mx-auto">
      <Card className="-mt-24 mx-2 md:mx-10 p-1">
        <CardHeader className="flex flex-col sm:flex-row gap-4 justify-between items-start sm:items-center">
          <p className="font-bold text-lg">Account page</p>
          <AccountModal />
        </CardHeader>
      </Card>
      <AccountList userId={userId} />
    </div>
  );
};

export default Accounts;
