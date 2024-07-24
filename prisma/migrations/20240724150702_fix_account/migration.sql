/*
  Warnings:

  - You are about to drop the column `user_name` on the `Account` table. All the data in the column will be lost.
  - Added the required column `account_name` to the `Account` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Account" DROP COLUMN "user_name",
ADD COLUMN     "account_name" TEXT NOT NULL;
