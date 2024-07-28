'use server';

import { db } from '@/libs/db';
import { ApiError } from '@/handlers/apiError';
import { Account } from '@prisma/client';
import { AccountFormTypes } from '@/validation/accountValidation';

export const createAccount = async ({
  userId,
  accountData,
}: {
  userId: string;
  accountData: AccountFormTypes;
}): Promise<Account> => {
  try {
    return await db.account.create({
      data: {
        userId,
        ...accountData,
      },
    });
  } catch (error) {
    throw ApiError.internalError('Failed to create account');
  }
};
