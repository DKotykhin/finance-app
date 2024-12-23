import React, { Suspense } from 'react';

import type { Metadata } from 'next';

import { PaymentContent } from './PaymentContent';
import { paymentSuccessMetadata } from '@/metadata/metadata';

export const metadata: Metadata = paymentSuccessMetadata;

const PaymentSuccessPage: React.FC = () => {
  return (
    <div className="max-w-screen-2xl mx-auto">
      <Suspense fallback={<p>Loading...</p>}>
        <PaymentContent />
      </Suspense>
    </div>
  );
};

export default PaymentSuccessPage;
