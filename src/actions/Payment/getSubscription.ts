'use server';

import type { Subscription } from '@prisma/client';

import { db } from '@/libs';
import { ApiError } from '@/handlers';

import { checkAuth } from '../checkAuth';

export const getSubscription = async (): Promise<Subscription | null> => {
  const userId = await checkAuth();

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
