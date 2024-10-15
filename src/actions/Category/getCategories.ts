'use server';

import type { Category } from '@prisma/client';

import { db } from '@/libs/db';
import { ApiError } from '@/handlers/apiError';


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
  } catch (error: any) {
    throw ApiError.internalError(error.message || 'Failed to get categories');
  }
};
