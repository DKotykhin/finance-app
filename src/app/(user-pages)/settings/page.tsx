import React from 'react';

import { auth } from '@clerk/nextjs/server';
import { Card, CardBody, CardHeader } from '@nextui-org/react';
import type { Metadata } from 'next';

import { settingsMetadata } from '@/metadata/metadata';
import { PagesSettings } from './PagesSettings';
import { PaymentSettings } from './PaymentSettings';

export const metadata: Metadata = settingsMetadata;

const Settings: React.FC = () => {
  const { userId }: { userId: string | null } = auth();

  return (
    <div className="max-w-screen-2xl mx-auto">
      <div className="flex flex-col gap-4 -mt-24 mb-12">
        <Card className="p-1 sm:p-4">
          <CardHeader>
            <p className="font-bold text-xl">Pages Settings</p>
          </CardHeader>
          <CardBody>
            <PagesSettings userId={userId} />
          </CardBody>
        </Card>
        <Card className="p-1 sm:p-4">
          <CardBody>
            <PaymentSettings userId={userId} />
          </CardBody>
        </Card>
      </div>
    </div>
  );
};

export default Settings;
