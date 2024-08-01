'use server';

import { db } from '@/libs/db';
import { ApiError } from '@/handlers/apiError';
import { Transaction } from '@prisma/client';
import { checkAuth } from '../checkAuth';
import { TransactionToUpdate } from '@/app/(user-pages)/transactions/TransactionModal';

export const updateTransaction = async ({
  transactionId,
  transactionData,
}: {
  transactionId: string;
  transactionData: TransactionToUpdate;
}): Promise<Transaction> => {
  checkAuth();

  try {
    const transaction = await db.transaction.update({
      where: {
        id: transactionId,
      },
      data: {
        ...transactionData,
        amount: parseFloat(transactionData.amount),
      },
    });

    return transaction;
  } catch (error) {
    throw ApiError.internalError('Failed to update transaction');
  }
};
