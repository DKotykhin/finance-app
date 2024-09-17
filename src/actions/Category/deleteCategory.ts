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
  } catch (error: any) {
    throw ApiError.internalError(error.message || 'Failed to delete category');
  }
};
