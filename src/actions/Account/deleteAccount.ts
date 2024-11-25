'use server';

import { db } from '@/libs';
import { ApiError } from '@/handlers';
import { idValidate } from '@/validation';
import { logger } from '@/logger';

import { checkAuth } from '../checkAuth';

export const deleteAccount = async (id: string): Promise<void> => {
  await checkAuth();
  
  await idValidate({ id });

  try {
    await db.account.delete({
      where: {
        id,
      },
    });

    logger.info(`Successfully deleted account with id ${id}`);
  } catch (error: any) {
    logger.error(error);
    throw ApiError.internalError(error.message || 'Failed to delete account');
  }
};
