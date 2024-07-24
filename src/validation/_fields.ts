import { z } from 'zod';

export const textFieldRequired = z
  .string()
  .trim()
  .min(2, { message: 'Minimum 2 characters to fill' })
  .max(50, { message: 'Maximum 50 characters to fill' });

export const textFieldOptional = z.string().trim().max(50, { message: 'Maximum 50 characters to fill' });

export const areaTextField = z.string().trim().max(250, { message: 'Maximum 250 characters to fill' });

export const price = z
  .string()
  .trim()
  .min(1, { message: 'Minimum 1 characters to fill' })
  .max(12, { message: 'Maximum 12 characters to fill' });
