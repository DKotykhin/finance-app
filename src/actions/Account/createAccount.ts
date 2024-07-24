'use server';

import { db } from '@/libs/db';
import { ApiError } from '@/handlers/apiError';
import { Account } from '@prisma/client';

export const createAccount = async ({
  userId,
  accountName,
}: {
  userId: string;
  accountName: string;
}): Promise<Account> => {
  try {
    const account = await db.account.create({
      data: {
        userId,
        accountName,
      },
    });

    return account;
  } catch (error) {
    throw ApiError.internalError('Failed to create account');
  }
};
