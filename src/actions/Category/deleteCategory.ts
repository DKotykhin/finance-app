'use server';

import { db } from '@/libs/db';
import { ApiError } from '@/handlers/apiError';
import { idValidate } from '@/validation/idValidation';

import { checkAuth } from '../checkAuth';

export const deleteCategory = async (id: string): Promise<void> => {
  checkAuth();

  await idValidate({ id });

  try {
    await db.category.delete({
      where: {
        id,
      },
    });
  } catch (error: any) {
    throw ApiError.internalError(error.message || 'Failed to delete category');
  }
};
