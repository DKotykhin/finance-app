'use server';

import type { Account } from '@prisma/client';

import { db } from '@/libs';
import { ApiError } from '@/handlers';
import type { AccountFormTypes} from '@/validation';
import { accountValidate } from '@/validation';
import { logger } from '@/logger';

import { checkAuth } from '../checkAuth';

export const updateAccount = async ({
  accountId,
  accountData,
}: {
  accountId: string;
  accountData: AccountFormTypes;
}): Promise<Account> => {
  await checkAuth();
  await accountValidate(accountData);

  if (!accountId) {
    throw ApiError.badRequest('Account ID is required');
  }
  
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

    const updatedAccount = await db.account.update({
      where: {
        id: accountId,
      },
      data: {
        ...accountData,
      },
    });

    logger.info(`Successfully updated account with id ${accountId}`);

    return updatedAccount;
  } catch (error: any) {
    logger.error(error);
    throw ApiError.internalError(error.message || 'Failed to update account');
  }
};
