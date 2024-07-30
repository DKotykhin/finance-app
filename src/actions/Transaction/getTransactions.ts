'use server';

import { subDays } from 'date-fns';

import { db } from '@/libs/db';
import { ApiError } from '@/handlers/apiError';
import { Transaction } from '@prisma/client';
import { checkAuth } from '../checkAuth';

export const getTransactions = async ({
  accountId,
  from,
  to,
}: {
  accountId: string;
  from?: Date;
  to?: Date;
}): Promise<Transaction[]> => {
  checkAuth();

  const defaultTo = new Date();
  const defaultFrom = subDays(defaultTo, 30);

  try {
    const transactions = await db.transaction.findMany({
      where: {
        accountId,
        date: {
          gte: from || defaultFrom,
          lte: to || defaultTo,
        },
      },
      include: {
        category: {
          select: {
            name: true,
          },
        },
      },
      orderBy: {
        date: 'desc',
      },
    });

    return transactions;
  } catch (error) {
    throw ApiError.internalError('Failed to get transactions');
  }
};
