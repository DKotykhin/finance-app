'use client';

import React, { useState } from 'react';
import { Card, CardBody, CardHeader, Radio, RadioGroup, Select, Selection, SelectItem } from '@nextui-org/react';
import { BarChart3, LineChart, AreaChart } from 'lucide-react';
import { TransactionCharts, UserSettings } from '@prisma/client';

import { TransactionsWithStats } from '@/actions/Transaction/_index';

import { TransactionChart } from './TransactionsChart';
import { Period } from '../const';

interface TransactionsCardProps {
  transactionData?: TransactionsWithStats;
  previousTransactionData?: TransactionsWithStats;
  userSettingsData?: UserSettings | null;
  isUserSettingsLoading: boolean;
}

export const TransactionsCard: React.FC<TransactionsCardProps> = ({
  transactionData,
  previousTransactionData,
  userSettingsData,
  isUserSettingsLoading,
}) => {
  const [chartView, setChartView] = useState<Selection>(
    new Set([userSettingsData?.dashboardTransactionsChart || TransactionCharts.BarChart])
  );
  const [selectedPeriod, setSelectedPeriod] = useState<Period>(Period.Current);

  return (
    <Card className="w-full lg:w-[calc(66.67%+6px)]">
      <CardHeader>
        <div className="w-full flex flex-col gap-6 sm:flex-row sm:justify-between sm:items-end">
          <div>
            <p className="card-title mb-4">Transactions</p>
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
            <SelectItem key={TransactionCharts.BarChart} startContent={<BarChart3 color="#2563eb" />}>
              Bar Chart
            </SelectItem>
            <SelectItem key={TransactionCharts.LineChart} startContent={<LineChart color="#2563eb" />}>
              Line Chart
            </SelectItem>
            <SelectItem key={TransactionCharts.AreaChart} startContent={<AreaChart color="#2563eb" />}>
              Area Chart
            </SelectItem>
          </Select>
        </div>
      </CardHeader>
      <CardBody className="pl-0 pb-6">
        {transactionData ? (
          selectedPeriod === Period.Current && transactionData.transactions.length === 0 ? (
            <div className="text-gray-400 italic pl-3 pt-6 h-[500px]">No transactions in current period to display</div>
          ) : previousTransactionData &&
            selectedPeriod === Period.Previous &&
            previousTransactionData.transactions.length === 0 ? (
            <div className="text-gray-400 italic pl-3 pt-6 h-[500px]">
              No transactions in previous period to display
            </div>
          ) : (
            <TransactionChart
              currentTransactions={transactionData.transactions}
              previousTransactions={previousTransactionData?.transactions || []}
              selectedPeriod={selectedPeriod}
              selectedView={Array.from(chartView)[0] as TransactionCharts}
            />
          )
        ) : (
          <div className="text-gray-400 italic pl-3 pt-6 h-[500px]">No data available</div>
        )}
      </CardBody>
    </Card>
  );
};
