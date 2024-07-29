import { Currency } from '@prisma/client';

export const columns = [
  {
    key: 'accountName',
    label: 'Account Name',
    sortable: true,
  },
  {
    key: 'balance',
    label: 'Balance',
    sortable: true,
  },
  {
    key: 'createdAt',
    label: 'Created',
    sortable: true,
  },
  {
    key: 'actions',
    label: 'Actions',
  },
];

export const rowsPerPageArray = [
  {
    key: '5',
    label: '5',
  },
  {
    key: '10',
    label: '10',
  },
  {
    key: '20',
    label: '20',
  },
];

export const currencyMap = new Map([
  [Currency.USD, { sign: '$' }],
  [Currency.EUR, { sign: '€' }],
  [Currency.GBP, { sign: '£' }],
  [Currency.UAH, { sign: '₴' }],
]);
