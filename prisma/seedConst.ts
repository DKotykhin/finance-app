import { Currency } from '@prisma/client';

import type { CategoryFormTypes } from '../src/validation/categoryValidation';
import type { AccountFormTypes } from '../src/validation/accountValidation';

export const userId = 'user_2jVYHAZKO3OanLZ3NfsGwvuzXLg';
export const transactionAmount = 120;

export const categoryData: CategoryFormTypes[] = [
  {
    categoryName: 'Food',
    hidden: false,
  },
  {
    categoryName: 'Travel',
    hidden: false,
  },
  {
    categoryName: 'Health',
    hidden: false,
  },
  {
    categoryName: 'Entertainment',
    hidden: false,
  },
  {
    categoryName: 'Shopping',
    hidden: false,
  },
  {
    categoryName: 'Gifts',
    hidden: false,
  },
  {
    categoryName: 'Transportation',
    hidden: false,
  },
  {
    categoryName: 'Education',
    hidden: false,
  },
  {
    categoryName: 'Utilities',
    hidden: false,
  },
  {
    categoryName: 'Housing',
    hidden: false,
  },
  {
    categoryName: 'Insurance',
    hidden: false,
  },
  {
    categoryName: 'Personal Care',
    hidden: false,
  },
  {
    categoryName: 'Other',
    hidden: false,
  },
];

export const accountData: AccountFormTypes[] = [
  {
    accountName: 'Cash',
    isDefault: true,
    hideDecimal: false,
    currency: Currency.USD,
  },
  {
    accountName: 'Bank',
    isDefault: false,
    hideDecimal: false,
    currency: Currency.EUR,
  },
  {
    accountName: 'Credit Card',
    isDefault: false,
    hideDecimal: false,
    currency: Currency.GBP,
  },
  {
    accountName: 'Investment',
    isDefault: false,
    hideDecimal: false,
    currency: Currency.UAH,
  },
  {
    accountName: 'Loan',
    isDefault: false,
    hideDecimal: false,
    currency: Currency.USD,
  },
];

export const loremWords = [
  'lorem',
  'ipsum',
  'dolor',
  'sit',
  'amet',
  'consectetur',
  'adipiscing',
  'elit',
  'sed',
  'do',
  'eiusmod',
  'tempor',
  'incididunt',
  'ut',
  'labore',
  'et',
  'dolore',
  'magna',
  'aliqua',
  'ut',
  'enim',
  'ad',
  'minim',
  'veniam',
  'quis',
  'nostrud',
  'exercitation',
  'ullamco',
  'laboris',
  'nisi',
  'ut',
  'aliquip',
  'ex',
  'ea',
  'commodo',
  'consequat',
  'duis',
  'aute',
  'irure',
  'dolor',
  'in',
  'reprehenderit',
  'in',
  'voluptate',
  'velit',
  'esse',
  'cillum',
  'dolore',
  'eu',
  'fugiat',
  'nulla',
  'pariatur',
  'excepteur',
  'sint',
  'occaecat',
  'cupidatat',
  'non',
  'proident',
  'sunt',
  'in',
  'culpa',
  'qui',
  'officia',
  'deserunt',
  'mollit',
  'anim',
  'id',
  'est',
  'laborum',
];
