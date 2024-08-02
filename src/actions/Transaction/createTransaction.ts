'use server';

import { db } from '@/libs/db';
import { ApiError } from '@/handlers/apiError';
import { Transaction } from '@prisma/client';
import { checkAuth } from '../checkAuth';

export const createTransaction = async (data: Partial<Transaction>): Promise<Transaction> => {
  checkAuth();

  try {
    const transaction = await db.transaction.create({
      data: {
        ...data,
        accountId: data.accountId as string,
      },
    });

    return transaction;
  } catch (error) {
    throw ApiError.internalError('Failed to create transaction');
  }
};
