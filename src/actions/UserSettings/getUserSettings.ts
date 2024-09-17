'use server';

import { db } from '@/libs/db';
import { ApiError } from '@/handlers/apiError';
import { UserSettings } from '@prisma/client';

import { checkAuth } from '../checkAuth';

export const getUserSettings = async ({ userId }: { userId: string }): Promise<UserSettings | null> => {
  checkAuth();

  try {
    const userSettings = await db.userSettings.findUnique({
      where: {
        userId,
      },
    });

    return userSettings;
  } catch (error: any) {
    throw ApiError.internalError(error.message || 'Error getting user settings');
  }
};
