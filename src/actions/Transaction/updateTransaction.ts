'use server';

import { db } from '@/libs/db';
import { ApiError } from '@/handlers/apiError';
import { Transaction } from '@prisma/client';
import { checkAuth } from '../checkAuth';

export const updateTransaction = async ({
  id,
  amount,
  date,
  notes,
  accountId,
  categoryId,
}: {
  id: string;
  amount: number;
  date: Date;
  notes: string;
  accountId: string;
  categoryId: string;
}): Promise<Transaction> => {
  checkAuth();

  try {
    const transaction = await db.transaction.update({
      where: {
        id,
      },
      data: {
        date,
        amount,
        notes,
        accountId,
        categoryId,
      },
    });

    return transaction;
  } catch (error) {
    throw ApiError.internalError('Failed to update transaction');
  }
};
