import { z } from 'zod';

import { textFieldRequired } from '@/validation/_fields';

export const categoryFormValidationSchema = z.object({
  categoryName: textFieldRequired,
  hidden: z.boolean().optional(),
});

export type CategoryFormTypes = z.infer<typeof categoryFormValidationSchema>;
