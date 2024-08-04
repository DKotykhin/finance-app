import { z } from 'zod';
import { Currency } from '@prisma/client';

import { textFieldRequired } from '@/validation/_fields';
import { ApiError } from '@/handlers/apiError';

export const accountFormValidationSchema = z.object({
  accountName: textFieldRequired,
  currency: z.nativeEnum(Currency),
  hideDecimal: z.boolean(),
  isDefault: z.boolean(),
});

export const idValidationSchema = z.object({
  id: z.string().cuid({ message: 'Id is not a cuid type' }),
});

export type AccountFormTypes = z.infer<typeof accountFormValidationSchema>;

export const accountValidate = async (validateData: AccountFormTypes) => {
  try {
    return await accountFormValidationSchema.parseAsync(validateData);
  } catch (err: any) {
    throw ApiError.unprocessableEntity(err.issues[0]?.message || 'Failed to validate account');
  }
};

export const idValidate = async (validateData: { id: string }) => {
  try {
    return await idValidationSchema.parseAsync(validateData);
  } catch (err: any) {
    throw ApiError.unprocessableEntity(err.issues[0]?.message || 'Failed to validate id');
  }
};
