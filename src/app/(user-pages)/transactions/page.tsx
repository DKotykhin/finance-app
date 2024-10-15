import React from 'react';

import type { Metadata } from 'next';

import { transactionsMetadata } from '@/metadata/metadata';
import { TransactionCard } from './TransactionCard';

export const metadata: Metadata = transactionsMetadata;

const Transactions: React.FC = () => {
  return (
    <div className="max-w-screen-2xl mx-auto">
      <TransactionCard />
    </div>
  );
};

export default Transactions;
