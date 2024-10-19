'use server';

import { endOfDay, startOfDay, subDays } from 'date-fns';

import type { Currency, Transaction } from '@prisma/client';

import { db } from '@/libs';
import { ApiError } from '@/handlers';

import { checkAuth } from '../checkAuth';

export interface ExtendedTransaction extends Transaction {
  category: { categoryName: string } | null;
  account: { accountName: string; currency: Currency; hideDecimal: boolean; isDefault: boolean };
}

export const getTransactions = async ({
  accountIds,
  from,
  to,
}: {
  accountIds: string[];
  from?: Date;
  to?: Date;
}): Promise<ExtendedTransaction[]> => {
  checkAuth();

  const dateFrom = startOfDay(from || subDays(new Date(), 30));
  const dateTo = endOfDay(to || new Date());

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
      include: {
        category: {
          select: {
            categoryName: true,
          },
        },
        account: {
          select: {
            accountName: true,
            currency: true,
            hideDecimal: true,
            isDefault: true,
          },
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
