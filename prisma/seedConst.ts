import { Currency } from '@prisma/client';

import { CategoryFormTypes } from '../src/validation/categoryValidation';
import { AccountFormTypes } from '../src/validation/accountValidation';

export const userId = 'user_2jVYHAZKO3OanLZ3NfsGwvuzXLg';
export const transactionAmount = 200;

export const categoryData: CategoryFormTypes[] = [
  {
    name: 'Food',
    hidden: false,
  },
  {
    name: 'Travel',
    hidden: false,
  },
  {
    name: 'Health',
    hidden: false,
  },
  {
    name: 'Entertainment',
    hidden: false,
  },
  {
    name: 'Shopping',
    hidden: false,
  },
  {
    name: 'Gifts',
    hidden: false,
  },
  {
    name: 'Transportation',
    hidden: false,
  },
  {
    name: 'Education',
    hidden: false,
  },
  {
    name: 'Utilities',
    hidden: false,
  },
  {
    name: 'Housing',
    hidden: false,
  },
  {
    name: 'Insurance',
    hidden: false,
  },
  {
    name: 'Personal Care',
    hidden: false,
  },
  {
    name: 'Other',
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
