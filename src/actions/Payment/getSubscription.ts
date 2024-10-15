'use server';

import type { Subscription } from '@prisma/client';

import { db } from '@/libs/db';
import { ApiError } from '@/handlers/apiError';


export const getSubscription = async ({ userId }: { userId: string }): Promise<Subscription | null> => {
  if (!userId) return null;

  try {
    const subscription = await db.subscription.findFirst({
      where: {
        userId,
        OR: [{ endDate: { gte: new Date() } }, { endDate: null }],
      },
    });

    return subscription;
  } catch (error: any) {
    throw ApiError.internalError(error.message || 'Failed to get subscription');
  }
};
