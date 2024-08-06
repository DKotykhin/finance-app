'use client';

import React, { useState } from 'react';
import { Card, CardBody, CardHeader, Radio, RadioGroup, Select, Selection, SelectItem } from '@nextui-org/react';
import { BarChart3, LineChart, AreaChart } from 'lucide-react';

import { TransactionsWithStats } from '@/actions/Transaction/_index';
import { TransactionChart } from './TransactionsChart';
import { ChartView, Period } from '../const';

interface TransactionsCardProps {
  transactionData?: TransactionsWithStats;
  previousTransactionData?: TransactionsWithStats;
}

export const TransactionsCard: React.FC<TransactionsCardProps> = ({ transactionData, previousTransactionData }) => {
  const [chartView, setChartView] = useState<Selection>(new Set([ChartView.BarChart]));
  const [selectedPeriod, setSelectedPeriod] = useState<Period>(Period.Current);

  return (
    <Card className="w-full lg:w-[calc(66.67%+6px)]">
      <CardHeader>
        <div className="w-full flex flex-col gap-6 sm:flex-row sm:justify-between sm:items-end">
          <div>
            <p className="text-2xl font-semibold mb-4">Transactions</p>
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
          >
            <SelectItem key={ChartView.BarChart} startContent={<BarChart3 color="#2563eb" />}>
              Bar Chart
            </SelectItem>
            <SelectItem key={ChartView.LineChart} startContent={<LineChart color="#2563eb" />}>
              Line Chart
            </SelectItem>
            <SelectItem key={ChartView.AreaChart} startContent={<AreaChart color="#2563eb" />}>
              Area Chart
            </SelectItem>
          </Select>
        </div>
      </CardHeader>
      <CardBody className="pl-0 pb-6">
        <TransactionChart
          currentTransactions={transactionData?.transactions || []}
          previousTransactions={previousTransactionData?.transactions || []}
          selectedPeriod={selectedPeriod}
          selectedView={Array.from(chartView)[0] as ChartView}
        />
      </CardBody>
    </Card>
  );
};
