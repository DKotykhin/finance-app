import { auth } from '@clerk/nextjs/server';
import { ApiError } from '@/handlers/apiError';

export const checkAuth = () => {
  const { userId }: { userId: string | null } = auth();

  if (!userId) {
    throw ApiError.unauthorized('Unauthorized');
  }
  return userId;
};
