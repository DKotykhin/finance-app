'use server';

import { db } from '@/libs/db';
import { ApiError } from '@/handlers/apiError';
import { Category } from '@prisma/client';
import { CategoryFormTypes } from '@/validation/categoryValidation';
import { checkAuth } from '../checkAuth';

export const createCategory = async ({ categoryData }: { categoryData: CategoryFormTypes }): Promise<Category> => {
  const userId = checkAuth();

  try {
    return await db.category.create({
      data: {
        userId,
        ...categoryData,
      },
    });
  } catch (error: any) {
    throw ApiError.internalError(error.message || 'Failed to create category');
  }
};
