'use server';

import { db } from '@/libs/db';
import { ApiError } from '@/handlers/apiError';
import { checkAuth } from '../checkAuth';

export const deleteTransaction = async ({ id }: { id: string }): Promise<void> => {
  checkAuth();

  try {
    await db.transaction.delete({
      where: {
        id,
      },
    });
  } catch (error) {
    throw ApiError.internalError('Failed to delete transaction');
  }
};