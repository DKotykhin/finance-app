'use server';

import { endOfDay, startOfDay, subDays } from 'date-fns';

import { db } from '@/libs/db';
import { ApiError } from '@/handlers/apiError';
import { Transaction } from '@prisma/client';

import { checkAuth } from '../checkAuth';

export interface TransactionsWithStats {
  transactions: Transaction[];
  income: number;
  expense: number;
  remaining: number;
}

export const getTransactionsWithStats = async ({
  accountId,
  from,
  to,
}: {
  accountId: string;
  from?: Date;
  to?: Date;
}): Promise<TransactionsWithStats> => {
  checkAuth();

  const dateFrom = startOfDay(from || subDays(new Date(), 30));
  const dateTo = endOfDay(to || new Date());

  try {
    const transactions = await db.transaction.findMany({
      where: {
        accountId,
        date: {
          gte: dateFrom,
          lte: dateTo,
        },
      },
      orderBy: {
        date: 'desc',
      },
    });

    const income =
      Math.round(
        transactions
          .filter((transaction) => transaction.amount > 0)
          .reduce((acc, transaction) => acc + transaction.amount, 0) * 100
      ) / 100;

    const expense =
      Math.round(
        transactions
          .filter((transaction) => transaction.amount < 0)
          .reduce((acc, transaction) => acc + transaction.amount, 0) * 100
      ) / 100;

    const remaining = Math.round((income + expense) * 100) / 100;

    return { transactions, income, expense, remaining };
  } catch (error) {
    throw ApiError.internalError('Failed to get transactions');
  }
};
