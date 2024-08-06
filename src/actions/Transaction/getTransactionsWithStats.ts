'use server';

import { endOfDay, startOfDay, subDays } from 'date-fns';

import { db } from '@/libs/db';
import { ApiError } from '@/handlers/apiError';
import { Currency, Transaction } from '@prisma/client';

import { checkAuth } from '../checkAuth';

export interface TransactionsWithStats {
  transactions: (Transaction & { category: { name: string } | null } & {
    account: { currency: Currency; hideDecimal: boolean };
  })[];
  income: {
    count: number;
    amount: number;
    uniqueCategoriesCount: number;
  };
  expense: {
    count: number;
    amount: number;
    uniqueCategoriesCount: number;
  };
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
      include: {
        category: {
          select: {
            name: true,
          },
        },
        account: {
          select: {
            currency: true,
            hideDecimal: true,
          },
        },
      },
      orderBy: {
        date: 'asc',
      },
    });

    const incomeCount = transactions.filter((transaction) => transaction.amount > 0)?.length;
    const expenseCount = transactions.filter((transaction) => transaction.amount < 0)?.length;

    const incomeUniqueCategoriesCount = new Set(
      transactions.filter((transaction) => transaction.amount > 0).map((transaction) => transaction.category?.name)
    ).size;
    const expenseUniqueCategoriesCount = new Set(
      transactions.filter((transaction) => transaction.amount < 0).map((transaction) => transaction.category?.name)
    ).size;

    const incomeAmount =
      Math.round(
        transactions
          .filter((transaction) => transaction.amount > 0)
          .reduce((acc, transaction) => acc + transaction.amount, 0) * 100
      ) / 100;

    const expenseAmount =
      Math.round(
        transactions
          .filter((transaction) => transaction.amount < 0)
          .reduce((acc, transaction) => acc + transaction.amount, 0) * 100
      ) / 100;

    const remaining = Math.round((incomeAmount + expenseAmount) * 100) / 100;

    return {
      transactions,
      income: { count: incomeCount, amount: incomeAmount, uniqueCategoriesCount: incomeUniqueCategoriesCount },
      expense: { count: expenseCount, amount: expenseAmount, uniqueCategoriesCount: expenseUniqueCategoriesCount },
      remaining,
    };
  } catch (error) {
    throw ApiError.internalError('Failed to get transactions');
  }
};
