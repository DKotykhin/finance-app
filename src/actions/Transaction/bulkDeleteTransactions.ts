'use server';

import { db } from '@/libs/db';
import { ApiError } from '@/handlers/apiError';
import { idValidate } from '@/validation/idValidation';

import { checkAuth } from '../checkAuth';

export const bulkDeleteTransactions = async (ids: string[]): Promise<void> => {
  checkAuth();

  ids.forEach(async (id) => {
    await idValidate({ id });
  });

  try {
    await db.transaction.deleteMany({
      where: {
        id: {
          in: ids,
        },
      },
    });
  } catch (error) {
    throw ApiError.internalError('Failed to delete transactions');
  }
};
