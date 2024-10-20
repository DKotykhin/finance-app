'use client';

import React, { useState } from 'react';

import type {
  Selection} from '@nextui-org/react';
import {
  Card,
  CardBody,
  CardFooter,
  CardHeader,
  Radio,
  RadioGroup,
  Select,
  SelectItem,
} from '@nextui-org/react';
import { PieChart, RadarIcon, RadiusIcon } from 'lucide-react';
import type { UserSettings } from '@prisma/client';
import { CategoriesCharts, TransactionType } from '@prisma/client';
import { format } from 'date-fns';

import type { TransactionsByCategory } from '@/actions';

import { Period } from '../const';
import { CategoriesChart } from './CategoriesChart';

interface CategoriesCardProps {
  transactionByCategoryData?: TransactionsByCategory;
  previousTransactionByCategoryData?: TransactionsByCategory;
  userSettingsData?: UserSettings | null;
  isUserSettingsLoading: boolean;
  currentPeriod: { start: Date; end: Date };
  previousPeriod: { start: Date; end: Date };
}

export const CategoriesCard: React.FC<CategoriesCardProps> = ({
  transactionByCategoryData,
  previousTransactionByCategoryData,
  userSettingsData,
  isUserSettingsLoading,
  currentPeriod,
  previousPeriod,
}) => {
  const [selectedPeriod, setSelectedPeriod] = useState<Period>(Period.Current);

  const [chartView, setChartView] = useState<Selection>(
    new Set([userSettingsData?.dashboardCategoriesChart || CategoriesCharts.PieChart])
  );

  const [selectedFlowType, setSelectedFlowType] = useState<TransactionType>(TransactionType.Income);

  return (
    <Card className="w-full lg:w-[calc(33.33%-6px)]">
      <CardHeader>
        <div className="w-full flex flex-col gap-6 sm:flex-row sm:justify-between sm:items-end">
          <div>
            <p className="card-title mb-1">Categories</p>
            {selectedPeriod === Period.Current ? (
              <p className="text-sm text-gray-400 mb-4">
                {`Your categories ${format(new Date(currentPeriod.start), 'dd MMM')} - ${format(new Date(currentPeriod.end), 'dd MMM')}`}
              </p>
            ) : (
              <p className="text-sm text-gray-400 mb-4">
                {`Your categories ${format(new Date(previousPeriod.start), 'dd MMM')} - ${format(new Date(previousPeriod.end), 'dd MMM')}`}
              </p>
            )}
            <RadioGroup
              label="Select period"
              orientation="horizontal"
              value={selectedPeriod}
              onValueChange={(value: string) => setSelectedPeriod(value as Period)}
            >
              <Radio value={Period.Current} classNames={{ label: 'text-sm' }}>
                Current
              </Radio>
              <Radio value={Period.Previous} classNames={{ label: 'text-sm' }}>
                Previous
              </Radio>
            </RadioGroup>
          </div>
          <Select
            label="Select chart view"
            className="w-full sm:max-w-[180px]"
            selectedKeys={chartView}
            onSelectionChange={setChartView}
            isLoading={isUserSettingsLoading}
          >
            <SelectItem key={CategoriesCharts.PieChart} startContent={<PieChart color="#2563eb" />}>
              Pie Chart
            </SelectItem>
            <SelectItem key={CategoriesCharts.RadarChart} startContent={<RadarIcon color="#2563eb" />}>
              Radar Chart
            </SelectItem>
            <SelectItem key={CategoriesCharts.RadialBarChart} startContent={<RadiusIcon color="#2563eb" />}>
              Radial Chart
            </SelectItem>
          </Select>
        </div>
      </CardHeader>
      {!transactionByCategoryData || !previousTransactionByCategoryData ? (
        <div className="text-gray-400 italic pl-3 pt-6 h-[424px]">No data available</div>
      ) : selectedPeriod === Period.Current &&
        !transactionByCategoryData.income.length &&
        selectedFlowType === TransactionType.Income ? (
        <div className="text-gray-400 italic pl-3 pt-6 h-[424px]">No income in current period</div>
      ) : selectedPeriod === Period.Current &&
        !transactionByCategoryData.expenses.length &&
        selectedFlowType === TransactionType.Expenses ? (
        <div className="text-gray-400 italic pl-3 pt-6 h-[424px]">No expenses in current period</div>
      ) : selectedPeriod === Period.Previous &&
        !previousTransactionByCategoryData.income.length &&
        selectedFlowType === TransactionType.Income ? (
        <div className="text-gray-400 italic pl-3 pt-6 h-[424px]">No income in previous period</div>
      ) : selectedPeriod === Period.Previous &&
        !previousTransactionByCategoryData.expenses.length &&
        selectedFlowType === TransactionType.Expenses ? (
        <div className="text-gray-400 italic pl-3 pt-6 h-[424px]">No expenses in previous period</div>
      ) : (
        <CardBody>
          <CategoriesChart
            currentTransactionByCategory={transactionByCategoryData}
            previousTransactionByCategory={previousTransactionByCategoryData}
            selectedPeriod={selectedPeriod}
            selectedView={Array.from(chartView)[0] as CategoriesCharts}
            selectedFlow={selectedFlowType}
          />
        </CardBody>
      )}
      <CardFooter className="mb-4">
        <RadioGroup
          label="Select finance flow"
          orientation="horizontal"
          value={selectedFlowType}
          onValueChange={(value: string) => setSelectedFlowType(value as TransactionType)}
        >
          <Radio value={TransactionType.Income} classNames={{ label: 'text-sm' }}>
            Income
          </Radio>
          <Radio value={TransactionType.Expenses} classNames={{ label: 'text-sm' }} color="warning">
            Expenses
          </Radio>
        </RadioGroup>
      </CardFooter>
    </Card>
  );
};
