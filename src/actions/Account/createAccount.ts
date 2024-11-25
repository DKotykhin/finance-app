'use server';

import type { Account } from '@prisma/client';

import { db } from '@/libs';
import { ApiError } from '@/handlers';
import type { AccountFormTypes} from '@/validation';
import { accountValidate } from '@/validation';
import { logger } from '@/logger';

import { checkAuth } from '../checkAuth';

export const createAccount = async (accountData: AccountFormTypes): Promise<Account> => {
  const userId = await checkAuth();
  
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

    const account = await db.account.create({
      data: {
        userId,
        ...accountData,
      },
    });

    logger.info(`Successfully created account with id ${account.id}`);

    return account;
  } catch (error: any) {
    logger.error(error);
    throw ApiError.internalError(error.message || 'Failed to create account');
  }
};
