'use server';

import { db } from '@/libs/db';
import { ApiError } from '@/handlers/apiError';
import { Account } from '@prisma/client';

export interface ExtendedAccount extends Account {
  transactions: { amount: number }[];
}

export const getAccounts = async (userId: string): Promise<ExtendedAccount[]> => {
  if (!userId) return [];

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

    return accounts;
  } catch (error) {
    throw ApiError.internalError('Failed to get account');
  }
};
