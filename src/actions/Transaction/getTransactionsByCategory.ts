'use server';

import { endOfDay, startOfDay, subDays } from 'date-fns';

import { db } from '@/libs';
import { ApiError } from '@/handlers';

import { checkAuth } from '../checkAuth';

export interface TransactionsByCategory {
  income: {
    categoryId: string | undefined | null;
    categoryName: string | undefined;
    amount: number | null;
    count: number;
  }[];
  expenses: {
    categoryId: string | undefined | null;
    categoryName: string | undefined;
    amount: number | null;
    count: number;
  }[];
}

export const getTransactionsByCategory = async ({
  accountId,
  from,
  to,
}: {
  accountId: string;
  from?: Date;
  to?: Date;
}): Promise<TransactionsByCategory> => {
  checkAuth();

  const dateFrom = startOfDay(from || subDays(new Date(), 30));
  const dateTo = endOfDay(to || new Date());

  try {
    const incomeTransactions = await db.transaction.groupBy({
      by: ['categoryId'],
      where: {
        accountId,
        date: {
          gte: dateFrom,
          lte: dateTo,
        },
        amount: {
          gt: 0,
        },
      },
      _sum: {
        amount: true,
      },
      _count: {
        categoryId: true,
      },
    });

    const expensesTransactions = await db.transaction.groupBy({
      by: ['categoryId'],
      where: {
        accountId,
        date: {
          gte: dateFrom,
          lte: dateTo,
        },
        amount: {
          lt: 0,
        },
      },
      _sum: {
        amount: true,
      },
      _count: {
        categoryId: true,
      },
    });

    const transactionWithCategoryName = await db.transaction.findMany({
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
            categoryName: true,
          },
        },
      },
    });

    const categoryList = transactionWithCategoryName.map((transaction) => ({
      categoryId: transaction.categoryId,
      categoryName: transaction.category?.categoryName,
    }));

    const incomeCategories = incomeTransactions.map((transaction) => ({
      categoryId: transaction.categoryId,
      categoryName:
        categoryList.find((category) => category.categoryId === transaction.categoryId)?.categoryName ||
        'Uncategorized',
      amount: transaction._sum.amount ? Math.abs(Math.round(transaction._sum.amount)) : 0,
      count: transaction._count.categoryId,
    }));

    const expensesCategories = expensesTransactions.map((transaction) => ({
      categoryId: transaction.categoryId,
      categoryName:
        categoryList.find((category) => category.categoryId === transaction.categoryId)?.categoryName ||
        'Uncategorized',
      amount: transaction._sum.amount ? Math.abs(Math.round(transaction._sum.amount)) : 0,
      count: transaction._count.categoryId,
    }));

    return {
      income: incomeCategories,
      expenses: expensesCategories,
    };
  } catch (error: any) {
    throw ApiError.internalError(error.message || 'Failed to get transactions');
  }
};
