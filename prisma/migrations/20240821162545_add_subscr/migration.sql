/*
  Warnings:

  - You are about to drop the column `dashboard_flow_type` on the `UserSettings` table. All the data in the column will be lost.

*/
-- CreateEnum
CREATE TYPE "TransactionType" AS ENUM ('Income', 'Expenses');

-- CreateEnum
CREATE TYPE "SubscriptionType" AS ENUM ('Free', 'Monthly', 'Yearly');

-- AlterTable
ALTER TABLE "UserSettings" DROP COLUMN "dashboard_flow_type",
ADD COLUMN     "dashboard_transaction_type" "TransactionType" NOT NULL DEFAULT 'Income',
ADD COLUMN     "subscription_type" "SubscriptionType" NOT NULL DEFAULT 'Free';

-- DropEnum
DROP TYPE "FlowType";
