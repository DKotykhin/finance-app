'use server';

import { db } from '@/libs/db';
import { ApiError } from '@/handlers/apiError';
import { Category } from '@prisma/client';

export const getCategories = async (userId: string): Promise<Category[]> => {
  if (!userId) return [];

  try {
    const categories = await db.category.findMany({
      where: {
        userId,
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    return categories;
  } catch (error) {
    throw ApiError.internalError('Failed to get categories');
  }
};
