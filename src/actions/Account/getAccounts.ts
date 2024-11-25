'use server';

import type { Account } from '@prisma/client';

import { db } from '@/libs';
import { ApiError } from '@/handlers';
import { logger } from '@/logger';

import { checkAuth } from '../checkAuth';

export interface ExtendedAccount extends Account {
  transactions: { amount: number }[];
}

export const getAccounts = async (): Promise<ExtendedAccount[]> => {
  const userId = await checkAuth();

  try {
    const accounts = await db.account.findMany({
      where: {
        userId,
      },
      include: {
        transactions: {
          select: {
            amount: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    logger.info(`Successfully got accounts for user ${userId}`);

    return accounts;
  } catch (error: any) {
    logger.error(error);
    throw ApiError.internalError(error.message || 'Failed to get account');
  }
};
