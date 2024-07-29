'use server';

import { db } from '@/libs/db';
import { ApiError } from '@/handlers/apiError';
import { Category } from '@prisma/client';
import { CategoryFormTypes } from '@/validation/categoryValidation';

export const createCategory = async ({
  userId,
  categoryData,
}: {
  userId: string;
  categoryData: CategoryFormTypes;
}): Promise<Category> => {
  try {
    return await db.category.create({
      data: {
        userId,
        ...categoryData,
      },
    });
  } catch (error) {
    throw ApiError.internalError('Failed to create category');
  }
};
