'use server';

import type { Category } from '@prisma/client';

import { db } from '@/libs';
import { ApiError } from '@/handlers';
import { categoryValidate, type CategoryFormTypes } from '@/validation';

import { checkAuth } from '../checkAuth';

export const updateCategory = async ({
  categoryId,
  categoryData,
}: {
  categoryId: string;
  categoryData: CategoryFormTypes;
}): Promise<Category> => {
  await checkAuth();

  await categoryValidate(categoryData);

  try {
    return await db.category.update({
      where: {
        id: categoryId,
      },
      data: {
        ...categoryData,
      },
    });
  } catch (error: any) {
    throw ApiError.internalError(error.message || 'Failed to update category');
  }
};
