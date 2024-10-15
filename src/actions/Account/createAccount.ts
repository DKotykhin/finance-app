'use server';

import type { Account } from '@prisma/client';

import { db } from '@/libs/db';
import { ApiError } from '@/handlers/apiError';
import { accountValidate } from '@/validation/accountValidation';

import type { AccountFormTypes} from '@/validation/accountValidation';

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
  } catch (error: any) {
    throw ApiError.internalError(error.message || 'Failed to create account');
  }
};
