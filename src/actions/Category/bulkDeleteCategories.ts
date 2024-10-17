'use server';

import { db } from '@/libs/db';
import { ApiError } from '@/handlers/apiError';
import { idValidate } from '@/validation/idValidation';

import { checkAuth } from '../checkAuth';

export const bulkDeleteCategories = async (ids: string[]): Promise<void> => {
  checkAuth();

  ids.forEach(async (id) => {
    await idValidate({ id });
  });

  try {
    await db.category.deleteMany({
      where: {
        id: {
          in: ids,
        },
      },
    });
  } catch (error) {
    throw ApiError.internalError('Failed to delete categories');
  }
};
