'use server';

import { db } from '@/libs/db';
import { ApiError } from '@/handlers/apiError';
import { Category } from '@prisma/client';

export const getCategories = async ({ userId, hidden }: { userId: string; hidden?: boolean }): Promise<Category[]> => {
  if (!userId) return [];

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
  } catch (error) {
    throw ApiError.internalError('Failed to get categories');
  }
};
