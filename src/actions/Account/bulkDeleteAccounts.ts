'use server';

import { db } from '@/libs/db';
import { ApiError } from '@/handlers/apiError';
import { checkAuth } from '../checkAuth';

export const bulkDeleteAccounts = async (accountIds: string[]): Promise<void> => {
  checkAuth();

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
