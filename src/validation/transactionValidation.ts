import { z } from 'zod';

import { areaTextField } from '@/validation/_fields';

export const transactionFormValidationSchema = z.object({
  amount: z
    .string()
    .trim()
    .min(1, { message: 'Please enter a valid amount' })
    .max(10, { message: 'Please enter a valid amount' })
    .refine((value) => /^\d*\.?\d{0,2}$/.test(value), { message: 'Please enter up to 2 decimals' })
    .refine((val) => +val !== 0, { message: 'Please enter a non zero amount' }),
  notes: areaTextField,
  categoryId: z.string({ message: 'Please select a category' }).cuid({ message: 'Please select a category' }),
  accountId: z.string().cuid({ message: 'Please select an account' }),
});

export type TransactionFormTypes = z.infer<typeof transactionFormValidationSchema>;
