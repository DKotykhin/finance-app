import { z } from 'zod';

import { ApiError } from '@/handlers';

export const idValidationSchema = z.object({
  id: z.string().cuid({ message: 'Id is not a cuid type' }),
});

export const idValidate = async (validateData: { id: string }) => {
  try {
    return await idValidationSchema.parseAsync(validateData);
  } catch (err: any) {
    throw ApiError.unprocessableEntity(err.issues[0]?.message || 'Failed to validate id');
  }
};
