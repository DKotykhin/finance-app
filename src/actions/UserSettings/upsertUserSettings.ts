'use server';

import type { UserSettings } from '@prisma/client';

import { db } from '@/libs/db';
import { ApiError } from '@/handlers/apiError';


import { checkAuth } from '../checkAuth';

export const upsertUserSettings = async ({
  userId,
  userSettingsData,
}: {
  userId: string;
  userSettingsData?: Partial<UserSettings>;
}): Promise<UserSettings> => {
  checkAuth();

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
