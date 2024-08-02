'use server';

import { db } from '@/libs/db';
import { ApiError } from '@/handlers/apiError';
import { Transaction } from '@prisma/client';
import { checkAuth } from '../checkAuth';
import { TransactionUpdate } from '@/app/(user-pages)/transactions/TransactionList';

export const updateTransaction = async ({
  transactionId,
  transactionData,
}: {
  transactionId: string;
  transactionData: Omit<TransactionUpdate, 'id'>;
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
  } catch (error) {
    throw ApiError.internalError('Failed to update transaction');
  }
};
