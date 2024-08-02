'use server';

import { db } from '@/libs/db';
import { ApiError } from '@/handlers/apiError';
import { checkAuth } from '../checkAuth';

export const bulkDeleteTransactions = async (transactionIds: string[]): Promise<void> => {
  checkAuth();

  try {
    await db.transaction.deleteMany({
      where: {
        id: {
          in: transactionIds,
        },
      },
    });
  } catch (error) {
    throw ApiError.internalError('Failed to delete transactions');
  }
};
