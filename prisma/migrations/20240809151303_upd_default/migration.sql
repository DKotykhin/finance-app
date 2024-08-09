/*
  Warnings:

  - You are about to drop the column `defaultRowsPerPage` on the `Account` table. All the data in the column will be lost.
  - You are about to drop the column `defaultSortField` on the `Account` table. All the data in the column will be lost.
  - You are about to drop the column `defaultSortOrder` on the `Account` table. All the data in the column will be lost.
  - You are about to drop the column `defaultRowsPerPage` on the `Category` table. All the data in the column will be lost.
  - You are about to drop the column `defaultSortField` on the `Category` table. All the data in the column will be lost.
  - You are about to drop the column `defaultSortOrder` on the `Category` table. All the data in the column will be lost.
  - You are about to drop the column `defaultRowsPerPage` on the `Transaction` table. All the data in the column will be lost.
  - You are about to drop the column `defaultSortField` on the `Transaction` table. All the data in the column will be lost.
  - You are about to drop the column `defaultSortOrder` on the `Transaction` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Account" DROP COLUMN "defaultRowsPerPage",
DROP COLUMN "defaultSortField",
DROP COLUMN "defaultSortOrder";

-- AlterTable
ALTER TABLE "Category" DROP COLUMN "defaultRowsPerPage",
DROP COLUMN "defaultSortField",
DROP COLUMN "defaultSortOrder";

-- AlterTable
ALTER TABLE "Transaction" DROP COLUMN "defaultRowsPerPage",
DROP COLUMN "defaultSortField",
DROP COLUMN "defaultSortOrder";

-- CreateTable
CREATE TABLE "UserSettings" (
    "id" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "user_id" TEXT NOT NULL,
    "accountRowsPerPage" TEXT NOT NULL DEFAULT '5',
    "accountSortField" TEXT NOT NULL DEFAULT 'createdAt',
    "accountSortOrder" "SortOrder" NOT NULL DEFAULT 'descending',
    "categoryRowsPerPage" TEXT NOT NULL DEFAULT '5',
    "categorySortField" TEXT NOT NULL DEFAULT 'createdAt',
    "categorySortOrder" "SortOrder" NOT NULL DEFAULT 'descending',
    "transactionRowsPerPage" TEXT NOT NULL DEFAULT '5',
    "transactionSortField" TEXT NOT NULL DEFAULT 'date',
    "transactionSortOrder" "SortOrder" NOT NULL DEFAULT 'descending',

    CONSTRAINT "UserSettings_pkey" PRIMARY KEY ("id")
);
