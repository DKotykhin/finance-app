'use server';

import { db } from '@/libs/db';
import { ApiError } from '@/handlers/apiError';
import { checkAuth } from '../checkAuth';

export const bulkDeleteCategories = async (categoryIds: string[]): Promise<void> => {
  checkAuth();

  try {
    await db.category.deleteMany({
      where: {
        id: {
          in: categoryIds,
        },
      },
    });
  } catch (error) {
    throw ApiError.internalError('Failed to delete categories');
  }
};
