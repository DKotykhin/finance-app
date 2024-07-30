/*
  Warnings:

  - You are about to drop the column `visible` on the `Category` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Category" DROP COLUMN "visible",
ADD COLUMN     "hidden" BOOLEAN NOT NULL DEFAULT false;
