'use server';

import { db } from '@/libs/db';
import { ApiError } from '@/handlers/apiError';
import { Account } from '@prisma/client';

export const updateAccount = async ({
  accountId,
  accountName,
}: {
  accountId: string;
  accountName: string;
}): Promise<Account> => {
  try {
    const account = await db.account.update({
      where: {
        id: accountId,
      },
      data: {
        accountName,
      },
    });

    return account;
  } catch (error) {
    throw ApiError.internalError('Failed to update account');
  }
};
