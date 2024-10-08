'use server';

import { db } from '@/libs/db';
import { ApiError } from '@/handlers/apiError';
import { Transaction } from '@prisma/client';

import { checkAuth } from '../checkAuth';
import { TransactionCreate } from './createTransaction';

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
