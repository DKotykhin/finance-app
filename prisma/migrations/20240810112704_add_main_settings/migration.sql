-- CreateEnum
CREATE TYPE "TransactionCharts" AS ENUM ('BarChart', 'LineChart', 'AreaChart');

-- CreateEnum
CREATE TYPE "CategoriesCharts" AS ENUM ('PieChart', 'RadarChart', 'RadialBarChart');

-- CreateEnum
CREATE TYPE "FlowType" AS ENUM ('Income', 'Expenses');

-- AlterTable
ALTER TABLE "UserSettings" ADD COLUMN     "main_categories_charts" "CategoriesCharts" NOT NULL DEFAULT 'PieChart',
ADD COLUMN     "main_flow_type" "FlowType" NOT NULL DEFAULT 'Income',
ADD COLUMN     "main_period" INTEGER NOT NULL DEFAULT 30,
ADD COLUMN     "main_transaction_charts" "TransactionCharts" NOT NULL DEFAULT 'BarChart';
