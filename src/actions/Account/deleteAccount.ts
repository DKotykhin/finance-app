'use server';

import { db } from '@/libs/db';
import { ApiError } from '@/handlers/apiError';
import { idValidate } from '@/validation/idValidation';
import { logger } from '@/logger';

import { checkAuth } from '../checkAuth';

export const deleteAccount = async (id: string): Promise<void> => {
  checkAuth();
  
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
