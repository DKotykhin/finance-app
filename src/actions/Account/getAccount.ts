'use server';

import { db } from '@/libs/db';
import { ApiError } from '@/handlers/apiError';
import { Account } from '@prisma/client';

export const getAccount = async ({
  userId,
  accountId,
}: {
  userId: string;
  accountId: string;
}): Promise<Account | null> => {
  if (!userId || accountId) return null;

  try {
    const account = await db.account.findFirst({
      where: {
        userId,
        id: accountId,
      },
    });

    return account;
  } catch (error) {
    throw ApiError.internalError('Failed to get account');
  }
};
