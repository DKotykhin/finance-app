'use server';

import { db } from '@/libs';
import { ApiError } from '@/handlers';
import { idValidate } from '@/validation';

import { checkAuth } from '../checkAuth';

export const deleteTransaction = async (id: string): Promise<void> => {
  checkAuth();

  await idValidate({ id });

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
