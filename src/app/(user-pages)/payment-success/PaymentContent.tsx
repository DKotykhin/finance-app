'use client';

import React from 'react';

import { useRouter, useSearchParams } from 'next/navigation';

import { Button, Card, CardBody, CardHeader, Skeleton } from '@nextui-org/react';
import { CircleCheckBig, CircleX } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';

import { retrieveStripeSession } from '@/actions/Payment/stripeSession';

export const PaymentContent: React.FC = () => {
  const router = useRouter();
  const searchParams = useSearchParams();

  const session_id = searchParams.get('session_id');

  const { data, error, isLoading } = useQuery({
    enabled: !!session_id,
    queryKey: ['subscription'],
    queryFn: () => retrieveStripeSession(session_id as string),
  });

  return isLoading ? (
    <div className="-mt-24 mb-12 w-full flex justify-center">
      <Skeleton className="w-full max-w-sm h-48 rounded-lg bg-slate-100" />
    </div>
  ) : error ? (
    <div className="-mt-24 mb-12 w-full flex justify-center">
      <Card className="p-1 sm:p-4 max-w-sm w-full">
        <CardHeader>
          <div className="flex flex-col items-center w-full">
            <div className="flex items-center gap-4">
              <CircleX color="#f43f5e" size={30} />
              <p className="font-bold text-2xl uppercase text-red-400">Error</p>
            </div>
            <p className="text-gray-500 italic mt-2 mb-8">An error occurred while processing your payment</p>
          </div>
        </CardHeader>
        <CardBody>
          <div className="flex justify-center gap-4 w-full">
            <Button color="primary" variant="bordered" onClick={() => router.push('/dashboard')}>
              Go to Dashboard
            </Button>
            <Button color="primary" variant="solid" onClick={() => router.push('/payment-intend')}>
              Try again
            </Button>
          </div>
        </CardBody>
      </Card>
    </div>
  ) : (
    <div className="-mt-24 mb-12 w-full flex justify-center">
      <Card className="p-1 sm:p-4 max-w-sm w-full">
        <CardHeader>
          <div className="flex flex-col items-center w-full">
            <div className="flex items-center gap-4">
              <CircleCheckBig color="#4ade80" size={30} />
              <p className="font-bold text-2xl uppercase text-green-400">Success</p>
            </div>
            <p className="text-gray-500 italic mt-2 mb-8">{`you successfully subscribe to ${data?.type} plan`}</p>
          </div>
        </CardHeader>
        <CardBody>
          <div className="flex flex-col items-center w-full">
            <Button color="primary" variant="solid" onClick={() => router.push('/dashboard')}>
              Go to Dashboard
            </Button>
          </div>
        </CardBody>
      </Card>
    </div>
  );
};
