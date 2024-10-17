'use server';

import { db } from '@/libs/db';
import { ApiError } from '@/handlers/apiError';
import { idValidate } from '@/validation/idValidation';

import { checkAuth } from '../checkAuth';
import { logger } from '@/logger';

export const bulkDeleteAccounts = async (ids: string[]): Promise<void> => {
  checkAuth();

  ids.forEach(async (id) => {
    await idValidate({ id });
  });

  try {
    await db.account.deleteMany({
      where: {
        id: {
          in: ids,
        },
      },
    });

    logger.info(`Successfully deleted accounts with ids ${ids.toString()}`);
  } catch (error) {
    logger.error(error);
    throw ApiError.internalError('Failed to delete accounts');
  }
};
