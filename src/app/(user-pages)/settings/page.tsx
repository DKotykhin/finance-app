import React from 'react';
import { auth } from '@clerk/nextjs/server';

import { PagesSettings } from './PagesSettings';
import { PaymentSettings } from './PaymentSettings';

const Settings: React.FC = () => {
  const { userId }: { userId: string | null } = auth();

  return (
    <div className="max-w-screen-2xl mx-auto">
      <div className="flex flex-col gap-4 -mt-24 mb-12">
        <PagesSettings userId={userId} />
        <PaymentSettings userId={userId} />
      </div>
    </div>
  );
};

export default Settings;
