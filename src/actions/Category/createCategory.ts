'use server';

import type { Category } from '@prisma/client';

import { db } from '@/libs';
import { ApiError } from '@/handlers';
import { categoryValidate, type CategoryFormTypes } from '@/validation';

import { checkAuth } from '../checkAuth';

export const createCategory = async (categoryData: CategoryFormTypes): Promise<Category> => {
  const userId = checkAuth();

  await categoryValidate(categoryData);

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
