import { z } from 'zod';
import { Currency } from '@prisma/client';

import { ApiError } from '@/handlers';

import { textFieldRequired } from './_fields';

export const accountFormValidationSchema = z.object({
  accountName: textFieldRequired,
  currency: z.nativeEnum(Currency),
  hideDecimal: z.boolean(),
  isDefault: z.boolean(),
  color: z.string().optional(),
});

export type AccountFormTypes = z.infer<typeof accountFormValidationSchema>;

export const accountValidate = async (validateData: AccountFormTypes) => {
  try {
    return await accountFormValidationSchema.parseAsync(validateData);
  } catch (err: any) {
    throw ApiError.unprocessableEntity(err.issues[0]?.message || 'Failed to validate account');
  }
};
