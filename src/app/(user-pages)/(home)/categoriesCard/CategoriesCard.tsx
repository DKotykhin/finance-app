'use client';

import React, { useState } from 'react';
import {
  Card,
  CardBody,
  CardFooter,
  CardHeader,
  Radio,
  RadioGroup,
  Select,
  Selection,
  SelectItem,
} from '@nextui-org/react';
import { PieChart, RadarIcon, RadiusIcon } from 'lucide-react';

import { TransactionsByCategory } from '@/actions/Transaction/_index';
import { CategoriesChartView, FlowType, Period } from '../const';
import { CategoriesChart } from './CategoriesChart';

interface CategoriesCardProps {
  transactionByCategoryData?: TransactionsByCategory;
  previousTransactionByCategoryData?: TransactionsByCategory;
}

export const CategoriesCard: React.FC<CategoriesCardProps> = ({
  transactionByCategoryData,
  previousTransactionByCategoryData,
}) => {
  const [selectedPeriod, setSelectedPeriod] = useState<Period>(Period.Current);
  const [chartView, setChartView] = useState<Selection>(new Set([CategoriesChartView.PieChart]));
  const [selectedFlowType, setSelectedFlowType] = useState<FlowType>(FlowType.Income);

  return (
    <Card className="w-full lg:w-[calc(33.33%-6px)]">
      <CardHeader>
        <div className="w-full flex flex-col gap-6 sm:flex-row sm:justify-between sm:items-end">
          <div>
            <p className="card-title mb-4">Categories</p>
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
            <SelectItem key={CategoriesChartView.PieChart} startContent={<PieChart color="#2563eb" />}>
              Pie Chart
            </SelectItem>
            <SelectItem key={CategoriesChartView.RadarChart} startContent={<RadarIcon color="#2563eb" />}>
              Radar Chart
            </SelectItem>
            <SelectItem key={CategoriesChartView.RadialBarChart} startContent={<RadiusIcon color="#2563eb" />}>
              Radial Chart
            </SelectItem>
          </Select>
        </div>
      </CardHeader>
      <CardBody>
        <CategoriesChart
          currentTransactionByCategory={transactionByCategoryData}
          previousTransactionByCategory={previousTransactionByCategoryData}
          selectedPeriod={selectedPeriod}
          selectedView={Array.from(chartView)[0] as CategoriesChartView}
          selectedFlow={selectedFlowType}
        />
      </CardBody>
      <CardFooter className="mb-4">
        <RadioGroup
          label="Select finance flow"
          orientation="horizontal"
          value={selectedFlowType}
          onValueChange={(value: string) => setSelectedFlowType(value as FlowType)}
        >
          <Radio value={FlowType.Income} classNames={{ label: 'text-sm' }}>
            Income
          </Radio>
          <Radio value={FlowType.Expenses} classNames={{ label: 'text-sm' }} color="warning">
            Expenses
          </Radio>
        </RadioGroup>
      </CardFooter>
    </Card>
  );
};
