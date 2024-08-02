-- DropForeignKey
ALTER TABLE "Transaction" DROP CONSTRAINT "Transaction_account_id_fkey";

-- DropForeignKey
ALTER TABLE "Transaction" DROP CONSTRAINT "Transaction_category_id_fkey";

-- AlterTable
ALTER TABLE "Transaction" ALTER COLUMN "account_id" SET DEFAULT '',
ALTER COLUMN "category_id" SET DEFAULT '';

-- AddForeignKey
ALTER TABLE "Transaction" ADD CONSTRAINT "Transaction_account_id_fkey" FOREIGN KEY ("account_id") REFERENCES "Account"("id") ON DELETE SET DEFAULT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Transaction" ADD CONSTRAINT "Transaction_category_id_fkey" FOREIGN KEY ("category_id") REFERENCES "Category"("id") ON DELETE SET DEFAULT ON UPDATE CASCADE;
