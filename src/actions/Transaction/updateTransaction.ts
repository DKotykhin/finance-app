'use server';

import type { Transaction } from '@prisma/client';

import { db } from '@/libs';
import { ApiError } from '@/handlers';

import { checkAuth } from '../checkAuth';
import type { TransactionCreate } from './createTransaction';

export const updateTransaction = async ({
  transactionId,
  transactionData,
}: {
  transactionId: string;
  transactionData: TransactionCreate;
}): Promise<Transaction> => {
  checkAuth();

  try {
    const transaction = await db.transaction.update({
      where: {
        id: transactionId,
      },
      data: transactionData,
    });

    return transaction;
  } catch (error: any) {
    throw ApiError.internalError(error.message || 'Failed to update transaction');
  }
};
