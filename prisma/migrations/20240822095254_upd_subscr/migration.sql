-- AlterTable
ALTER TABLE "UserSettings" ADD COLUMN     "subscription_end" TIMESTAMP(3),
ADD COLUMN     "subscription_id" TEXT,
ADD COLUMN     "subscription_start" TIMESTAMP(3);
