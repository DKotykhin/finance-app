'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@nextui-org/react';

export const RedirectButton: React.FC = () => {
  const router = useRouter();

  return (
    <Button color="secondary" className="mb-12 shadow-lg" onClick={() => router.push('/sign-up')}>
      Register as a new user
    </Button>
  );
};
