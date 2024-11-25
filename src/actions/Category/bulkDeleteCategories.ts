'use server';

import { db } from '@/libs';
import { ApiError } from '@/handlers';
import { idValidate } from '@/validation';

import { checkAuth } from '../checkAuth';

export const bulkDeleteCategories = async (ids: string[]): Promise<void> => {
  await checkAuth();

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
  } catch (error: any) {
    throw ApiError.internalError(error.message || 'Failed to delete categories');
  }
};
