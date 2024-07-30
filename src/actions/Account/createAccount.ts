'use server';

import { db } from '@/libs/db';
import { ApiError } from '@/handlers/apiError';
import { Account } from '@prisma/client';
import { AccountFormTypes } from '@/validation/accountValidation';
import { checkAuth } from '../checkAuth';

export const createAccount = async ({ accountData }: { accountData: AccountFormTypes }): Promise<Account> => {
  const userId = checkAuth();

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
