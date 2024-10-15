'use server';

import { endOfDay, startOfDay } from 'date-fns';

import type { Transaction } from '@prisma/client';

import { db } from '@/libs/db';
import { ApiError } from '@/handlers/apiError';


import { checkAuth } from '../checkAuth';

export const getTodaysTransactions = async ({ accountIds }: { accountIds: string[] }): Promise<Transaction[]> => {
  checkAuth();

  const dateFrom = startOfDay(new Date());
  const dateTo = endOfDay(new Date());

  try {
    const transactions = await db.transaction.findMany({
      where: {
        accountId: {
          in: accountIds,
        },
        date: {
          gte: dateFrom,
          lte: dateTo,
        },
      },
      orderBy: {
        date: 'desc',
      },
    });

    return transactions;
  } catch (error: any) {
    throw ApiError.internalError(error.message || 'Failed to get transactions');
  }
};
