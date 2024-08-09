/*
  Warnings:

  - You are about to drop the column `description` on the `Category` table. All the data in the column will be lost.
  - You are about to drop the column `name` on the `Category` table. All the data in the column will be lost.
  - Added the required column `category_name` to the `Category` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "SortOrder" AS ENUM ('ascending', 'descending');

-- AlterTable
ALTER TABLE "Account" ADD COLUMN     "defaultRowsPerPage" TEXT NOT NULL DEFAULT '5',
ADD COLUMN     "defaultSortField" TEXT NOT NULL DEFAULT 'createdAt',
ADD COLUMN     "defaultSortOrder" "SortOrder" NOT NULL DEFAULT 'descending';

-- AlterTable
ALTER TABLE "Category" DROP COLUMN "description",
DROP COLUMN "name",
ADD COLUMN     "category_name" TEXT NOT NULL,
ADD COLUMN     "defaultRowsPerPage" TEXT NOT NULL DEFAULT '5',
ADD COLUMN     "defaultSortField" TEXT NOT NULL DEFAULT 'createdAt',
ADD COLUMN     "defaultSortOrder" "SortOrder" NOT NULL DEFAULT 'descending';

-- AlterTable
ALTER TABLE "Transaction" ADD COLUMN     "defaultRowsPerPage" TEXT NOT NULL DEFAULT '5',
ADD COLUMN     "defaultSortField" TEXT NOT NULL DEFAULT 'date',
ADD COLUMN     "defaultSortOrder" "SortOrder" NOT NULL DEFAULT 'descending';
