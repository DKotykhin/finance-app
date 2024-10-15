'use server';

import type { Transaction } from '@prisma/client';

import { db } from '@/libs/db';
import { ApiError } from '@/handlers/apiError';

import { checkAuth } from '../checkAuth';

export interface TransactionCreate {
  date: Date;
  amount: number;
  categoryId: string | null;
  accountId: string;
  notes: string | null;
}

export const createTransaction = async (data: TransactionCreate): Promise<Transaction> => {
  checkAuth();

  try {
    const transaction = await db.transaction.create({
      data: {
        ...data,
        accountId: data.accountId as string,
      },
    });

    return transaction;
  } catch (error: any) {
    throw ApiError.internalError(error.message || 'Failed to create transaction');
  }
};
