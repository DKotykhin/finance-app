import { z } from 'zod';

import { textFieldRequired } from '@/validation/_fields';
import { Currency } from '@prisma/client';

export const accountFormValidationSchema = z.object({
  accountName: textFieldRequired,
  currency: z.nativeEnum(Currency),
  hideDecimal: z.boolean(),
  isDefault: z.boolean(),
});

export type AccountFormTypes = z.infer<typeof accountFormValidationSchema>;
