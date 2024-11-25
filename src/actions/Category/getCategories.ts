'use server';

import type { Category } from '@prisma/client';

import { db } from '@/libs';
import { ApiError } from '@/handlers';
import { checkAuth } from '../checkAuth';

export const getCategories = async (hidden?: boolean): Promise<Category[]> => {
  const userId = await checkAuth();

  try {
    const categories = await db.category.findMany({
      where: {
        userId,
        hidden,
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    return categories;
  } catch (error: any) {
    throw ApiError.internalError(error.message || 'Failed to get categories');
  }
};
