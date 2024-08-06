import React from 'react';
import {
  Pie,
  PieChart,
  PolarAngleAxis,
  PolarGrid,
  PolarRadiusAxis,
  Radar,
  RadarChart,
  RadialBar,
  RadialBarChart,
  ResponsiveContainer,
  Tooltip,
} from 'recharts';

import { TransactionsByCategory } from '@/actions/Transaction/_index';
import { CategoriesChartView, FlowType, Period } from '../const';

interface CategoriesChartProps {
  currentTransactionByCategory?: TransactionsByCategory;
  previousTransactionByCategory?: TransactionsByCategory;
  selectedPeriod: Period;
  selectedView: CategoriesChartView;
  selectedFlow: FlowType;
}

export const CategoriesChart: React.FC<CategoriesChartProps> = ({
  currentTransactionByCategory,
  previousTransactionByCategory,
  selectedPeriod,
  selectedView,
  selectedFlow,
}) => {
  const incomeCurrentData = currentTransactionByCategory?.income.map((transaction) => ({
    name: transaction.categoryName,
    value: transaction.amount,
  }));
  const expensesCurrentData = currentTransactionByCategory?.expenses.map((transaction) => ({
    name: transaction.categoryName,
    value: transaction.amount,
  }));
  const incomePreviousData = previousTransactionByCategory?.income.map((transaction) => ({
    name: transaction.categoryName,
    value: transaction.amount,
  }));
  const expensesPreviousData = previousTransactionByCategory?.expenses.map((transaction) => ({
    name: transaction.categoryName,
    value: transaction.amount,
  }));

  const RADIAN = Math.PI / 180;
  const customizedLabel = ({
    cx,
    cy,
    midAngle,
    innerRadius,
    outerRadius,
    name,
  }: {
    cx: number;
    cy: number;
    midAngle: number;
    innerRadius: number;
    outerRadius: number;
    name: string;
  }) => {
    const radius = innerRadius + (outerRadius - innerRadius) * 1.5;
    const x = cx + radius * Math.cos(-midAngle * RADIAN);
    const y = cy + radius * Math.sin(-midAngle * RADIAN);

    return (
      <text x={x} y={y} fill="#808080" textAnchor={x > cx ? 'start' : 'end'} dominantBaseline="central" fontSize={14}>
        {name}
      </text>
    );
  };

  const CustomTooltip = ({ active, payload }: { active: boolean; payload: any[] }) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white border border-slate-400 rounded py-3 px-4">
          <p style={{ color: `${payload[0].payload.fill}` }}>{payload[0].payload.label}</p>
          <p className="mt-2 text-sm">{`${payload[0].payload.type} : ${payload[0].value}`}</p>
        </div>
      );
    }
    return null;
  };

  return (
    <>
      <ResponsiveContainer width="100%" height={400}>
        {selectedView === CategoriesChartView.PieChart ? (
          <PieChart>
            <Pie
              dataKey="value"
              data={
                selectedFlow === FlowType.Income
                  ? selectedPeriod === Period.Previous
                    ? incomePreviousData
                    : incomeCurrentData
                  : selectedPeriod === Period.Previous
                    ? expensesPreviousData
                    : expensesCurrentData
              }
              cx="50%"
              cy="50%"
              innerRadius={80}
              outerRadius={120}
              fill={selectedFlow === FlowType.Income ? '#2563eb' : '#ef4444'}
              fillOpacity={0.8}
              paddingAngle={5}
              label={customizedLabel}
            />
            <Tooltip />
          </PieChart>
        ) : selectedView === CategoriesChartView.RadialBarChart ? (
          <RadialBarChart
            cx="50%"
            cy="50%"
            innerRadius="10%"
            outerRadius="80%"
            barSize={16}
            data={
              selectedFlow === FlowType.Income
                ? selectedPeriod === Period.Previous
                  ? incomePreviousData?.map((data) => ({ ...data, fill: '#2563eb', label: data.name, type: 'Income' }))
                  : incomeCurrentData?.map((data) => ({ ...data, fill: '#2563eb', label: data.name, type: 'Income' }))
                : selectedPeriod === Period.Previous
                  ? expensesPreviousData?.map((data) => ({
                      ...data,
                      fill: '#ef4444',
                      label: data.name,
                      type: 'Expenses',
                    }))
                  : expensesCurrentData?.map((data) => ({
                      ...data,
                      fill: '#ef4444',
                      label: data.name,
                      type: 'Expenses',
                    }))
            }
          >
            <RadialBar label={{ position: 'insideStart', fill: '#fff' }} background dataKey="value" />
            <Tooltip content={<CustomTooltip active={false} payload={[]} />} />
          </RadialBarChart>
        ) : (
          <RadarChart
            cx="50%"
            cy="50%"
            outerRadius="60%"
            data={
              selectedFlow === FlowType.Income
                ? selectedPeriod === Period.Previous
                  ? incomePreviousData
                  : incomeCurrentData
                : selectedPeriod === Period.Previous
                  ? expensesPreviousData
                  : expensesCurrentData
            }
          >
            <PolarGrid />
            <PolarAngleAxis dataKey="name" style={{ fontSize: '12px' }} />
            <PolarRadiusAxis style={{ fontSize: '12px' }} />
            <Radar
              name={selectedFlow === FlowType.Income ? 'income' : 'expenses'}
              dataKey="value"
              stroke={selectedFlow === FlowType.Income ? '#2563eb' : '#ef4444'}
              fill={selectedFlow === FlowType.Income ? '#2563eb' : '#ef4444'}
              fillOpacity={0.6}
            />
            <Tooltip />
          </RadarChart>
        )}
      </ResponsiveContainer>
    </>
  );
};
