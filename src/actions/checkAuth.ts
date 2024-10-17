import { auth } from '@clerk/nextjs/server';

import { ApiError } from '@/handlers/apiError';
import { logger } from '@/logger';

export const checkAuth = () => {
  const { userId }: { userId: string | null } = auth();

  if (!userId) {
    logger.error('Unauthorized');
    throw ApiError.unauthorized('Unauthorized');
  }

  return userId;
};
