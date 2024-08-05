import React from 'react';
import { Pie, PieChart, ResponsiveContainer, Tooltip } from 'recharts';

import { TransactionsByCategory } from '@/actions/Transaction/_index';
import { Period } from './const';

interface CategoriesChartProps {
  currentTransactionByCategory?: TransactionsByCategory;
  previousTransactionByCategory?: TransactionsByCategory;
  selectedPeriod: Period;
}

export const CategoriesChart: React.FC<CategoriesChartProps> = ({
  currentTransactionByCategory,
  previousTransactionByCategory,
  selectedPeriod,
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

  return (
    <>
      <ResponsiveContainer width="100%" height="100%">
        <PieChart width={400} height={400}>
          <Pie
            dataKey="value"
            data={selectedPeriod === Period.Previous ? incomePreviousData : incomeCurrentData}
            cx="50%"
            cy="50%"
            innerRadius={80}
            outerRadius={120}
            fill="#2563eb"
            fillOpacity={0.8}
            paddingAngle={5}
            label={{ fill: '#808080' }}
          />
          <Pie
            dataKey="value"
            isAnimationActive={false}
            data={selectedPeriod === Period.Previous ? expensesPreviousData : expensesCurrentData}
            cx="50%"
            cy="50%"
            outerRadius={70}
            fill="#ef4444"
            fillOpacity={0.8}
            paddingAngle={5}
            label={{ fill: '#fff', fontSize: 12 }}
          />
          <Tooltip />
        </PieChart>
      </ResponsiveContainer>
    </>
  );
};
