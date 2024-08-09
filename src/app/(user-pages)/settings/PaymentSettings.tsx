'use client';

import React from 'react';
import { Card, CardBody, CardHeader } from '@nextui-org/react';

export const PaymentSettings: React.FC = () => {
  return (
    <Card className="p-1 sm:p-4">
      <CardHeader>
        <p className="font-bold text-xl">Payment Settings</p>
      </CardHeader>
      <CardBody></CardBody>
    </Card>
  );
};
