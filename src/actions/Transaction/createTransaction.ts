'use server';

import { db } from '@/libs/db';
import { ApiError } from '@/handlers/apiError';
import { Transaction } from '@prisma/client';
import { checkAuth } from '../checkAuth';

export const createTransaction = async ({
  amount,
  date,
  notes,
  accountId,
  categoryId,
}: {
  amount: number;
  date: Date;
  notes?: string;
  accountId: string;
  categoryId: string | null;
}): Promise<Transaction> => {
  checkAuth();

  try {
    const transaction = await db.transaction.create({
      data: {
        date,
        amount,
        notes: notes || null,
        accountId,
        categoryId,
      },
    });

    return transaction;
  } catch (error) {
    throw ApiError.internalError('Failed to create transaction');
  }
};
