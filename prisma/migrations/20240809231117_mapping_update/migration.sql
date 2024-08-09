/*
  Warnings:

  - You are about to drop the column `accountRowsPerPage` on the `UserSettings` table. All the data in the column will be lost.
  - You are about to drop the column `accountSortField` on the `UserSettings` table. All the data in the column will be lost.
  - You are about to drop the column `accountSortOrder` on the `UserSettings` table. All the data in the column will be lost.
  - You are about to drop the column `categoryRowsPerPage` on the `UserSettings` table. All the data in the column will be lost.
  - You are about to drop the column `categorySortField` on the `UserSettings` table. All the data in the column will be lost.
  - You are about to drop the column `categorySortOrder` on the `UserSettings` table. All the data in the column will be lost.
  - You are about to drop the column `transactionPeriod` on the `UserSettings` table. All the data in the column will be lost.
  - You are about to drop the column `transactionRowsPerPage` on the `UserSettings` table. All the data in the column will be lost.
  - You are about to drop the column `transactionSortField` on the `UserSettings` table. All the data in the column will be lost.
  - You are about to drop the column `transactionSortOrder` on the `UserSettings` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "UserSettings" DROP COLUMN "accountRowsPerPage",
DROP COLUMN "accountSortField",
DROP COLUMN "accountSortOrder",
DROP COLUMN "categoryRowsPerPage",
DROP COLUMN "categorySortField",
DROP COLUMN "categorySortOrder",
DROP COLUMN "transactionPeriod",
DROP COLUMN "transactionRowsPerPage",
DROP COLUMN "transactionSortField",
DROP COLUMN "transactionSortOrder",
ADD COLUMN     "account_rows_per_page" TEXT NOT NULL DEFAULT '5',
ADD COLUMN     "account_sort_field" TEXT NOT NULL DEFAULT 'createdAt',
ADD COLUMN     "account_sort_order" "SortOrder" NOT NULL DEFAULT 'descending',
ADD COLUMN     "category_rows_per_page" TEXT NOT NULL DEFAULT '5',
ADD COLUMN     "category_sort_field" TEXT NOT NULL DEFAULT 'createdAt',
ADD COLUMN     "category_sort_order" "SortOrder" NOT NULL DEFAULT 'descending',
ADD COLUMN     "transaction_period" INTEGER NOT NULL DEFAULT 30,
ADD COLUMN     "transaction_rows_per_page" TEXT NOT NULL DEFAULT '5',
ADD COLUMN     "transaction_sort_field" TEXT NOT NULL DEFAULT 'date',
ADD COLUMN     "transaction_sort_order" "SortOrder" NOT NULL DEFAULT 'descending';
