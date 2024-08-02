/*
  Warnings:

  - Made the column `account_id` on table `Transaction` required. This step will fail if there are existing NULL values in that column.

*/
-- DropForeignKey
ALTER TABLE "Transaction" DROP CONSTRAINT "Transaction_account_id_fkey";

-- AlterTable
ALTER TABLE "Transaction" ALTER COLUMN "account_id" SET NOT NULL,
ALTER COLUMN "account_id" DROP DEFAULT,
ALTER COLUMN "category_id" DROP DEFAULT;

-- AddForeignKey
ALTER TABLE "Transaction" ADD CONSTRAINT "Transaction_account_id_fkey" FOREIGN KEY ("account_id") REFERENCES "Account"("id") ON DELETE CASCADE ON UPDATE CASCADE;
