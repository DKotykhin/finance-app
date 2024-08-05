import React from 'react';
import {
  CartesianGrid,
  XAxis,
  YAxis,
  ResponsiveContainer,
  Tooltip,
  BarChart,
  Bar,
  Legend,
  LineChart,
  Line,
  AreaChart,
  Area,
} from 'recharts';
import { Transaction } from '@prisma/client';
import { format } from 'date-fns';

import { ChartView, Period } from './const';

interface TransactionChartProps {
  currentTransactions?: Transaction[];
  previousTransactions?: Transaction[];
  selectedPeriod: Period;
  selectedView: ChartView;
}

export const TransactionChart: React.FC<TransactionChartProps> = ({
  currentTransactions,
  previousTransactions,
  selectedPeriod,
  selectedView,
}) => {
  const currentData = currentTransactions?.map((transaction) => ({
    date: format(transaction.date, 'dd MMM'),
    amount: transaction.amount,
    ...(transaction.amount > 0 ? { income: transaction.amount } : { expenses: -transaction.amount }),
  }));

  const previousData = previousTransactions?.map((transaction) => ({
    date: format(transaction.date, 'dd MMM'),
    amount: transaction.amount,
    ...(transaction.amount > 0 ? { income: transaction.amount } : { expenses: -transaction.amount }),
  }));

  return (
    <ResponsiveContainer width="100%" height={500}>
      {selectedView === ChartView.LineChart ? (
        <LineChart data={selectedPeriod === Period.Previous ? previousData : currentData} margin={{ top: 10 }}>
          <XAxis dataKey="date" className="text-xs" padding={{ left: 30, right: 30 }} tickMargin={8} />
          <YAxis className="text-xs" />
          <Tooltip />
          <CartesianGrid stroke="#ccc" />
          <Line
            connectNulls
            type="monotone"
            dataKey="income"
            stroke="#2563eb"
            label={{ position: 'top', fontSize: 12 }}
            strokeWidth={2}
          />
          <Line
            connectNulls
            type="monotone"
            dataKey="expenses"
            stroke="#ef4444"
            label={{ position: 'top', fontSize: 12, formatter: (value: number) => `${-value}` }}
            strokeWidth={2}
          />
          <Legend />
        </LineChart>
      ) : selectedView === ChartView.AreaChart ? (
        <AreaChart data={selectedPeriod === Period.Previous ? previousData : currentData} margin={{ top: 10 }}>
          <XAxis dataKey="date" className="text-xs" padding={{ left: 30, right: 30 }} tickMargin={8} />
          <YAxis className="text-xs" />
          <Tooltip />
          <CartesianGrid stroke="#ccc" />
          <defs>
            <linearGradient id="income" x1="0" y1="0" x2="0" y2="1">
              <stop offset="2%" stopColor="#2563eb" stopOpacity={0.8} />
              <stop offset="98%" stopColor="#2563eb" stopOpacity={0} />
            </linearGradient>
            <linearGradient id="expenses" x1="0" y1="0" x2="0" y2="1">
              <stop offset="2%" stopColor="#ef4444" stopOpacity={0.8} />
              <stop offset="98%" stopColor="#ef4444" stopOpacity={0} />
            </linearGradient>
          </defs>
          <Area
            connectNulls
            type="monotone"
            dataKey="income"
            stackId="income"
            stroke="#2563eb"
            fill="url(#income)"
            label={{ position: 'top', fontSize: 12 }}
          />
          <Area
            connectNulls
            type="monotone"
            dataKey="expenses"
            stackId="expenses"
            stroke="#ef4444"
            fill="url(#expenses)"
            label={{ position: 'top', fontSize: 12, formatter: (value: number) => `${-value}` }}
            
          />
          <Legend />
        </AreaChart>
      ) : (
        <BarChart data={selectedPeriod === Period.Previous ? previousData : currentData} margin={{ top: 10 }}>
          <XAxis dataKey="date" className="text-xs" padding={{ left: 30, right: 30 }} tickMargin={8} />
          <YAxis className="text-xs" />
          <Tooltip />
          <CartesianGrid stroke="#ccc" />
          <Bar
            dataKey="income"
            barSize={30}
            fill="#2563eb"
            label={{ position: 'top', fontSize: 12 }}
            fillOpacity={0.8}
          />
          <Bar
            dataKey="expenses"
            barSize={30}
            fill="#ef4444"
            label={{ position: 'top', fontSize: 12, formatter: (value: number) => `${-value}` }}
            fillOpacity={0.8}
          />
          <Legend />
        </BarChart>
      )}
    </ResponsiveContainer>
  );
};
