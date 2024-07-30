'use server';

import { db } from '@/libs/db';
import { ApiError } from '@/handlers/apiError';
import { checkAuth } from '../checkAuth';

export const deleteCategory = async (categoryId: string): Promise<void> => {
  checkAuth();

  try {
    await db.category.delete({
      where: {
        id: categoryId,
      },
    });
  } catch (error) {
    throw ApiError.internalError('Failed to delete category');
  }
};
