import { Currency } from '@prisma/client';

export const currencyMap = new Map([
  [Currency.USD, { sign: '$' }],
  [Currency.EUR, { sign: '€' }],
  [Currency.GBP, { sign: '£' }],
  [Currency.UAH, { sign: '₴' }],
]);

export const numberWithSpaces = (num: number): string => {
  const str = num.toString().split('.');

  if (str[0].length >= 3) {
    str[0] = str[0].replace(/\d(?=(\d{3})+$)/g, '$& ');
  }

  if (str[1] && str[1].length >= 5) {
    str[1] = str[1].replace(/(\d{3})/g, '$& ');
  }

  return str.join('.');
};
