'use server';

import { db } from '@/libs/db';
import { ApiError } from '@/handlers/apiError';
import { checkAuth } from '../checkAuth';

export const deleteAccount = async (accountId: string): Promise<void> => {
  checkAuth();

  try {
    await db.account.delete({
      where: {
        id: accountId,
      },
    });
  } catch (error) {
    throw ApiError.internalError('Failed to delete account');
  }
};
