'use server';

import { db } from '@/libs/db';
import { ApiError } from '@/handlers/apiError';
import { idValidate } from '@/validation/accountValidation';

import { checkAuth } from '../checkAuth';

export const bulkDeleteAccounts = async (accountIds: string[]): Promise<void> => {
  checkAuth();
  accountIds.forEach(async (id) => {
    await idValidate({ id });
  });

  try {
    await db.account.deleteMany({
      where: {
        id: {
          in: accountIds,
        },
      },
    });
  } catch (error) {
    throw ApiError.internalError('Failed to delete accounts');
  }
};
