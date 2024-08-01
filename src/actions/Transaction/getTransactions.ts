'use server';

import { subDays } from 'date-fns';

import { db } from '@/libs/db';
import { ApiError } from '@/handlers/apiError';
import { Currency, Transaction } from '@prisma/client';
import { checkAuth } from '../checkAuth';

export interface ExtendedTransaction extends Transaction {
  category: { name: string };
  account: { accountName: string; currency: Currency; hideDecimal: boolean };
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

  const defaultTo = new Date();
  const defaultFrom = subDays(defaultTo, 30);

  try {
    const transactions = await db.transaction.findMany({
      where: {
        accountId: {
          in: accountIds,
        },
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
        account: {
          select: {
            accountName: true,
            currency: true,
            hideDecimal: true,
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
