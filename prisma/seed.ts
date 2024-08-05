import { Currency, PrismaClient } from '@prisma/client';

import { CategoryFormTypes } from '../src/validation/categoryValidation';
import { AccountFormTypes } from '../src/validation/accountValidation';
import { TransactionCreate } from '../src/actions/Transaction/createTransaction';
import { ApiError } from '../src/handlers/apiError';

const userId = 'user_2jVYHAZKO3OanLZ3NfsGwvuzXLg';

const categoryData: CategoryFormTypes[] = [
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

const accountData: AccountFormTypes[] = [
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

const prisma = new PrismaClient();

async function main() {
  try {
    return Promise.all([
      prisma.category.deleteMany(),
      prisma.account.deleteMany(),
      prisma.transaction.deleteMany(),
    ]).then(async () => [
      await prisma.category.createMany({
        data: categoryData.map((category) => {
          return {
            userId,
            ...category,
          };
        }),
        skipDuplicates: true,
      }),
      await prisma.account.createMany({
        data: accountData.map((account) => {
          return {
            userId,
            ...account,
          };
        }),
        skipDuplicates: true,
      }),
    ]);
  } catch (error) {
    throw ApiError.internalError('Failed to create category');
  }
}

async function getAccountIds() {
  const accounts = await prisma.account.findMany({
    where: {
      userId,
    },
  });

  return accounts.map((account) => account.id);
}

async function getCategoryIds() {
  const categories = await prisma.category.findMany({
    where: {
      userId,
    },
  });

  return categories.map((category) => category.id);
}

function getRandomValueBetween(min: number, max: number) {
  const randomDecimal = Math.random();
  const randomValue = Math.floor((min + randomDecimal * (max - min)) * 100) / 100;

  return randomValue;
}

function generateRandomDate() {
  const currentDate = new Date();
  const daysAgo60 = new Date();
  daysAgo60.setDate(currentDate.getDate() - 60);
  const randomDays = Math.floor(Math.random() * 61);
  const randomDate = new Date();
  randomDate.setDate(currentDate.getDate() - randomDays);

  return randomDate;
}

async function createTransactions() {
  try {
    const transactionAmount = 100;

    for (let i = 0; i < transactionAmount; i++) {
      const categoryIds = await getCategoryIds();
      const randomCategory = categoryIds[Math.floor(Math.random() * categoryIds.length)];
      const accountIds = await getAccountIds();
      const randomAccount = accountIds[Math.floor(Math.random() * accountIds.length)];
      const randomAmount = getRandomValueBetween(-1000, 1000);
      const randomDate = generateRandomDate();

      const transactionData: TransactionCreate = {
        date: randomDate,
        amount: randomAmount,
        categoryId: randomCategory,
        accountId: randomAccount,
        notes: 'Test ' + i,
      };

      await prisma.transaction.create({
        data: transactionData,
      });
    }
  } catch (error) {
    throw ApiError.internalError('Failed to create transaction');
  }
}

main()
  .then(async () => {
    await createTransactions();
    await prisma.$disconnect();
  })
  .catch(async () => {
    await prisma.$disconnect();
    process.exit(1);
  });
