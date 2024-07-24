import { z } from 'zod';

import { textFieldRequired } from '@/validation/_fields';

export const accountFormValidationSchema = z.object({
  accountName: textFieldRequired,
});
export type AccountFormTypes = z.infer<typeof accountFormValidationSchema>;
