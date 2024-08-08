import { z } from 'zod';

export const textFieldRequired = z
  .string()
  .trim()
  .min(2, { message: 'Minimum 2 characters to fill' })
  .max(50, { message: 'Maximum 50 characters to fill' });

export const textFieldOptional = z.string().trim().max(50, { message: 'Maximum 50 characters to fill' });

export const areaTextField = z.string().trim().max(100, { message: 'Maximum 100 characters to fill' }).optional();
