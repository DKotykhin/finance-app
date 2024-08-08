import { PrismaClient } from '@prisma/client';

import { TransactionCreate } from '../src/actions/Transaction/createTransaction';
import { ApiError } from '../src/handlers/apiError';

import { accountData, categoryData, loremWords, transactionAmount, userId } from './seedConst';

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

function generateLoremIpsumText(wordCount: number) {
  let loremIpsumText = '';

  for (let i = 0; i < wordCount; i++) {
    const randomIndex = Math.floor(Math.random() * loremWords.length);
    loremIpsumText += loremWords[randomIndex] + ' ';
  }

  return loremIpsumText.trim();
}

async function createTransactions() {
  try {
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
        notes: generateLoremIpsumText(3),
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
