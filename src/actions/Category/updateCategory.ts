'use server';

import { db } from '@/libs/db';
import { ApiError } from '@/handlers/apiError';
import { Category } from '@prisma/client';
import { CategoryFormTypes } from '@/validation/categoryValidation';

export const updateCategory = async ({
  categoryId,
  categoryData,
}: {
  categoryId: string;
  categoryData: CategoryFormTypes;
}): Promise<Category> => {
  try {
    return await db.category.update({
      where: {
        id: categoryId,
      },
      data: {
        ...categoryData,
      },
    });
  } catch (error) {
    throw ApiError.internalError('Failed to update category');
  }
};
