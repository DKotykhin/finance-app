'use server';

import { db } from '@/libs/db';
import { ApiError } from '@/handlers/apiError';
import { Account } from '@prisma/client';
import { AccountFormTypes, accountValidate } from '@/validation/accountValidation';

import { checkAuth } from '../checkAuth';

export const createAccount = async ({ accountData }: { accountData: AccountFormTypes }): Promise<Account> => {
  const userId = checkAuth();
  await accountValidate(accountData);

  try {
    if (accountData.isDefault) {
      await db.account.updateMany({
        where: {
          isDefault: true,
        },
        data: {
          isDefault: false,
        },
      });
    }

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
