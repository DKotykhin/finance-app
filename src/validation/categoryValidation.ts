import { z } from 'zod';

import { textFieldRequired } from '@/validation/_fields';
import { ApiError } from '@/handlers/apiError';

export const categoryFormValidationSchema = z.object({
  categoryName: textFieldRequired,
  hidden: z.boolean().optional(),
});

export type CategoryFormTypes = z.infer<typeof categoryFormValidationSchema>;

export const categoryValidate = async (validateData: CategoryFormTypes) => {
  try {
    return await categoryFormValidationSchema.parseAsync(validateData);
  } catch (err: any) {
    throw ApiError.unprocessableEntity(err.issues[0]?.message || 'Failed to validate category');
  }
};
