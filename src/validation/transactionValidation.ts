import { z } from 'zod';

import { areaTextField } from '@/validation/_fields';

export const transactionFormValidationSchema = z.object({
  // amount: z.string().trim().min(1, { message: 'Minimum 1 characters to fill' }),
  amount: z.number({ message: 'Please enter a valid amount' }).refine((val) => val !== 0, {
    message: 'Please enter a valid amount',
  }),
  notes: areaTextField,
  categoryId: z.string({ message: 'Please select a category' }).cuid({ message: 'Please select a category' }),
  accountId: z.string().cuid({ message: 'Please select an account' }),
});

export type TransactionFormTypes = z.infer<typeof transactionFormValidationSchema>;
