'use server';

import type { UserSettings } from '@prisma/client';

import { db } from '@/libs';
import { ApiError } from '@/handlers';

import { checkAuth } from '../checkAuth';

export const upsertUserSettings = async (userSettingsData?: Partial<UserSettings>): Promise<UserSettings> => {
  const userId = checkAuth();

  try {
    const userSettings = await db.userSettings.upsert({
      where: {
        userId,
      },
      update: {
        ...userSettingsData,
      },
      create: {
        userId,
        ...userSettingsData,
      },
    });

    return userSettings;
  } catch (error: any) {
    throw ApiError.internalError(error.message || 'Error updating user settings');
  }
};
