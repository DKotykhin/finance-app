'use server';

import { db } from '@/libs/db';
import { ApiError } from '@/handlers/apiError';
import { UserSettings } from '@prisma/client';

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
  } catch (error) {
    throw ApiError.internalError('Error updating user settings');
  }
};
