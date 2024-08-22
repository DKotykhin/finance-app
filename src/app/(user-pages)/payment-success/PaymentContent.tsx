'use client';

import React from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Button, Card, CardBody, CardHeader } from '@nextui-org/react';
import { CircleCheckBig } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';

import { retrieveStripeSession } from '@/actions/Payment/stripeSession';

export const PaymentContent: React.FC = () => {
  const router = useRouter();
  const searchParams = useSearchParams();

  const session_id = searchParams.get('session_id');

  const { data: userSettingsData } = useQuery({
    enabled: !!session_id,
    queryKey: ['userSettings'],
    queryFn: () => retrieveStripeSession(session_id as string),
  });

  return (
    <div className="-mt-24 mb-12 w-full flex justify-center">
      <Card className="p-1 sm:p-4 max-w-sm w-full">
        <CardHeader>
          <div className="flex flex-col items-center w-full">
            <div className="flex items-center gap-4">
              <CircleCheckBig color="#4ade80" size={30} />
              <p className="font-bold text-2xl uppercase text-green-400">Success</p>
            </div>
            <p className="text-gray-500 italic mt-2 mb-8">{`you successfully subscribe to ${userSettingsData?.subscriptionType} plan`}</p>
          </div>
        </CardHeader>
        <CardBody>
          <div className="flex flex-col items-center w-full">
            <Button color="success" variant="flat" onClick={() => router.push('/dashboard')}>
              Go to Dashboard
            </Button>
          </div>
        </CardBody>
      </Card>
    </div>
  );
};
