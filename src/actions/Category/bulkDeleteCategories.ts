'use server';

import { db } from '@/libs';
import { ApiError } from '@/handlers';
import { idValidate } from '@/validation';

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
