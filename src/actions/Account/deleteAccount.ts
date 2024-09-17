'use server';

import { db } from '@/libs/db';
import { ApiError } from '@/handlers/apiError';
import { idValidate } from '@/validation/accountValidation';

import { checkAuth } from '../checkAuth';

export const deleteAccount = async (accountId: string): Promise<void> => {
  checkAuth();
  await idValidate({ id: accountId });

  try {
    await db.account.delete({
      where: {
        id: accountId,
      },
    });
  } catch (error: any) {
    throw ApiError.internalError(error.message || 'Failed to delete account');
  }
};
