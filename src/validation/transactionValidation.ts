import { z } from 'zod';

import { areaTextField } from '@/validation/_fields';

export const transactionFormValidationSchema = z.object({
  amount: z.string().trim().min(1, { message: 'Minimum 1 characters to fill' }),
  notes: areaTextField,
  categoryId: z.string().cuid({ message: 'Please select a category' }),
  accountId: z.string().cuid({ message: 'Please select an account' }),
});

export type TransactionFormTypes = z.infer<typeof transactionFormValidationSchema>;
