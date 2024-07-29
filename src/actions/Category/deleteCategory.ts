'use server';

import { db } from '@/libs/db';
import { ApiError } from '@/handlers/apiError';

export const deleteCategory = async (categoryId: string): Promise<void> => {
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
