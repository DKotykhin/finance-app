'use server';

import { db } from '@/libs/db';
import { ApiError } from '@/handlers/apiError';
import { Account } from '@prisma/client';
import { AccountFormTypes } from '@/validation/accountValidation';

export const updateAccount = async ({
  accountId,
  accountData,
}: {
  accountId: string;
  accountData: AccountFormTypes;
}): Promise<Account> => {
  try {
    return await db.account.update({
      where: {
        id: accountId,
      },
      data: {
        ...accountData,
      },
    });
  } catch (error) {
    throw ApiError.internalError('Failed to update account');
  }
};
