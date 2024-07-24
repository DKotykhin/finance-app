'use server';

import { db } from '@/libs/db';
import { ApiError } from '@/handlers/apiError';
import { Account } from '@prisma/client';

export const getAccount = async (userId: string): Promise<Account[]> => {
  if (!userId) return [];

  try {
    const account = await db.account.findMany({
      where: {
        userId,
      },
    });

    return account;
  } catch (error) {
    throw ApiError.internalError('Failed to get account');
  }
};
