'use server';

import { db } from '@/libs/db';
import { ApiError } from '@/handlers/apiError';
import { checkAuth } from '../checkAuth';

export const deleteTransaction = async (id: string): Promise<void> => {
  checkAuth();

  try {
    await db.transaction.delete({
      where: {
        id,
      },
    });
  } catch (error: any) {
    throw ApiError.internalError(error.message || 'Failed to delete transaction');
  }
};
