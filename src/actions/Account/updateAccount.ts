'use server';

import type { Account } from '@prisma/client';

import { db } from '@/libs/db';
import { ApiError } from '@/handlers/apiError';
import type { AccountFormTypes} from '@/validation/accountValidation';
import { accountValidate } from '@/validation/accountValidation';
import { logger } from '@/logger';

import { checkAuth } from '../checkAuth';

export const updateAccount = async ({
  accountId,
  accountData,
}: {
  accountId: string;
  accountData: AccountFormTypes;
}): Promise<Account> => {
  checkAuth();
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
