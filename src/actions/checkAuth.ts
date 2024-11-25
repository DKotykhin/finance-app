import { auth } from '@clerk/nextjs/server';

import { ApiError } from '@/handlers';
import { logger } from '@/logger';

export const checkAuth = async () => {
  const { userId }: { userId: string | null } = await auth();

  if (!userId) {
    logger.error('Unauthorized');
    throw ApiError.unauthorized('Unauthorized');
  }

  return userId;
};
