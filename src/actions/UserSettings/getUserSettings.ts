'use server';

import type { UserSettings } from '@prisma/client';

import { db } from '@/libs/db';
import { ApiError } from '@/handlers/apiError';

import { checkAuth } from '../checkAuth';

export const getUserSettings = async (): Promise<UserSettings | null> => {
  const userId = checkAuth();

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
