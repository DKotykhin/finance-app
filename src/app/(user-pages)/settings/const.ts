import { SortOrder } from '@prisma/client';

export const categoryFieldArray: { key: string; label: string }[] = [
  { key: 'createdAt', label: 'Date Created' },
  { key: 'updatedAt', label: 'Date Updated' },
  { key: 'categoryName', label: 'Category Name' },
];

export const accountFieldArray: { key: string; label: string }[] = [
  { key: 'createdAt', label: 'Date Created' },
  { key: 'updatedAt', label: 'Date Updated' },
  { key: 'accountName', label: 'Account Name' },
  { key: 'balance', label: 'Balance' },
];

export const transactionFieldArray: { key: string; label: string }[] = [
  { key: 'date', label: 'Transaction Date' },
  { key: 'amount', label: 'Amount' },
  { key: 'period', label: 'Period' },
];

export const periodArray = [1, 7, 14, 30, 60, 90, 180, 365];

export const sortOrderArray: { key: SortOrder; label: string }[] = [
  { key: 'descending', label: 'Descending' },
  { key: 'ascending', label: 'Ascending' },
];
