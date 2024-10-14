/*
  Warnings:

  - You are about to drop the column `subscription_end` on the `UserSettings` table. All the data in the column will be lost.
  - You are about to drop the column `subscription_id` on the `UserSettings` table. All the data in the column will be lost.
  - You are about to drop the column `subscription_start` on the `UserSettings` table. All the data in the column will be lost.
  - You are about to drop the column `subscription_type` on the `UserSettings` table. All the data in the column will be lost.

*/
-- CreateEnum
CREATE TYPE "SubscriptionStatus" AS ENUM ('Active', 'Inactive', 'Canceled');

-- AlterTable
ALTER TABLE "UserSettings" DROP COLUMN "subscription_end",
DROP COLUMN "subscription_id",
DROP COLUMN "subscription_start",
DROP COLUMN "subscription_type";

-- CreateTable
CREATE TABLE "Subscription" (
    "id" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "user_id" TEXT NOT NULL,
    "type" "SubscriptionType" NOT NULL,
    "start_date" TIMESTAMP(3) NOT NULL,
    "end_date" TIMESTAMP(3),
    "cancelled_at" TIMESTAMP(3),
    "price" INTEGER NOT NULL,
    "mode" TEXT NOT NULL,
    "currency" TEXT NOT NULL,
    "customer_id" TEXT NOT NULL,
    "customer_email" TEXT,
    "subscription_id" TEXT NOT NULL,
    "status" "SubscriptionStatus" NOT NULL DEFAULT 'Inactive',

    CONSTRAINT "Subscription_pkey" PRIMARY KEY ("id")
);
