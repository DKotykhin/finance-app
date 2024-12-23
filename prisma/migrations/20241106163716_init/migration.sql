-- CreateEnum
CREATE TYPE "Currency" AS ENUM ('USD', 'EUR', 'GBP', 'UAH');

-- CreateEnum
CREATE TYPE "SortOrder" AS ENUM ('ascending', 'descending');

-- CreateEnum
CREATE TYPE "TransactionCharts" AS ENUM ('BarChart', 'LineChart', 'AreaChart');

-- CreateEnum
CREATE TYPE "CategoriesCharts" AS ENUM ('PieChart', 'RadarChart', 'RadialBarChart');

-- CreateEnum
CREATE TYPE "TransactionType" AS ENUM ('Income', 'Expenses');

-- CreateEnum
CREATE TYPE "SubscriptionType" AS ENUM ('FREE', 'PRO', 'GOLD');

-- CreateEnum
CREATE TYPE "SubscriptionStatus" AS ENUM ('Active', 'Inactive', 'Canceled');

-- CreateTable
CREATE TABLE "Account" (
    "id" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "user_id" TEXT NOT NULL,
    "account_name" TEXT NOT NULL,
    "currency" "Currency" NOT NULL DEFAULT 'USD',
    "hideDecimal" BOOLEAN NOT NULL DEFAULT false,
    "isDefault" BOOLEAN NOT NULL DEFAULT false,
    "color" TEXT NOT NULL DEFAULT 'slate',

    CONSTRAINT "Account_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Category" (
    "id" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "category_name" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "hidden" BOOLEAN NOT NULL DEFAULT false,
    "color" TEXT NOT NULL DEFAULT 'slate',

    CONSTRAINT "Category_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Transaction" (
    "id" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "amount" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "notes" TEXT,
    "transaction_date" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "account_id" TEXT NOT NULL,
    "category_id" TEXT,

    CONSTRAINT "Transaction_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "UserSettings" (
    "id" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "user_id" TEXT NOT NULL,
    "account_rows_per_page" TEXT NOT NULL DEFAULT '5',
    "account_sort_field" TEXT NOT NULL DEFAULT 'createdAt',
    "account_sort_order" "SortOrder" NOT NULL DEFAULT 'descending',
    "category_rows_per_page" TEXT NOT NULL DEFAULT '5',
    "category_sort_field" TEXT NOT NULL DEFAULT 'createdAt',
    "category_sort_order" "SortOrder" NOT NULL DEFAULT 'descending',
    "transaction_rows_per_page" TEXT NOT NULL DEFAULT '5',
    "transaction_sort_field" TEXT NOT NULL DEFAULT 'date',
    "transaction_sort_order" "SortOrder" NOT NULL DEFAULT 'descending',
    "transaction_period" INTEGER NOT NULL DEFAULT 30,
    "dashboard_period" INTEGER NOT NULL DEFAULT 30,
    "dashboard_transaction_charts" "TransactionCharts" NOT NULL DEFAULT 'BarChart',
    "dashboard_categories_charts" "CategoriesCharts" NOT NULL DEFAULT 'PieChart',
    "dashboard_transaction_type" "TransactionType" NOT NULL DEFAULT 'Income',

    CONSTRAINT "UserSettings_pkey" PRIMARY KEY ("id")
);

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

-- CreateIndex
CREATE UNIQUE INDEX "UserSettings_user_id_key" ON "UserSettings"("user_id");

-- AddForeignKey
ALTER TABLE "Transaction" ADD CONSTRAINT "Transaction_account_id_fkey" FOREIGN KEY ("account_id") REFERENCES "Account"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Transaction" ADD CONSTRAINT "Transaction_category_id_fkey" FOREIGN KEY ("category_id") REFERENCES "Category"("id") ON DELETE SET NULL ON UPDATE CASCADE;
