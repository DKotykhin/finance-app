'use server';

import type { UserSettings } from '@prisma/client';

import { db } from '@/libs';
import { ApiError } from '@/handlers';

import { checkAuth } from '../checkAuth';

export const updateRating = async (rating: number): Promise<UserSettings> => {
  const userId = checkAuth();

  try {
    const userSettings = await db.userSettings.upsert({
      where: {
        userId,
      },
      update: {
        rating,
      },
      create: {
        userId,
        rating,
      },
    });

    return userSettings;
  } catch (error: any) {
    throw ApiError.internalError(error.message || 'Error updating user settings');
  }
}