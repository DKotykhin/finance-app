import { z } from 'zod';

import { textFieldOptional, textFieldRequired } from '@/validation/_fields';

export const transactionFormValidationSchema = z.object({
  amount: textFieldRequired,
  notes: textFieldOptional,
  categoryId: z.string().cuid(),
  accountId: z.string().cuid(),
});

export type TransactionFormTypes = z.infer<typeof transactionFormValidationSchema>;
