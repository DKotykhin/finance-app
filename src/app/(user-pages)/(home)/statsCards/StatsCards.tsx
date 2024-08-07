'use client';

import React, { useMemo } from 'react';
import { Card, CardBody, CardHeader, Chip } from '@nextui-org/react';
import { TransactionsWithStats } from '@/actions/Transaction/_index';
import { TrendingDown, TrendingUp } from 'lucide-react';
import { format } from 'date-fns';
import { Currency } from '@prisma/client';

import { cn, currencyMap } from '@/utils/_index';

interface StatsCardsProps {
  transactionData?: TransactionsWithStats;
  period?: number;
}

export const StatsCards: React.FC<StatsCardsProps> = ({ transactionData, period }) => {
  const lastTransactions = useMemo(() => {
    if (!transactionData) return [];
    const sortedData = [...transactionData?.transactions].sort((a, b) => b.date.getTime() - a.date.getTime());
    return sortedData.slice(0, 5);
  }, [transactionData]);

  const minMaxTransaction = useMemo(() => {
    if (!transactionData) return {};
    const sortedData = [...transactionData?.transactions].sort((a, b) => a.amount - b.amount);
    return {
      min: sortedData[0].amount < 0 ? sortedData[0] : null,
      max: sortedData[sortedData.length - 1].amount > 0 ? sortedData[sortedData.length - 1] : null,
    };
  }, [transactionData]);

  return (
    <div className="flex flex-wrap lg:flex-nowrap gap-4 justify-between my-8">
      <Card className="w-full">
        <CardHeader>
          <p className="card-title">Last Transactions</p>
        </CardHeader>
        <CardBody>
          {lastTransactions && lastTransactions.length > 0 ? (
            <div className="flex flex-col gap-x-4 gap-y-6">
              {lastTransactions.map((transaction, index) => (
                <div
                  key={index}
                  className="flex flex-col-reverse sm:flex-row gap-2 sm:gap-6 sm:items-center justify-between"
                >
                  <div className="flex gap-2 sm:gap-6 items-center justify-between">
                    {transaction.amount > 0 ? (
                      <div className="p-1 rounded-md bg-green-500/10">
                        <TrendingUp color="#22c55e" size={18} />
                      </div>
                    ) : (
                      <div className="p-1 rounded-md bg-red-500/10">
                        <TrendingDown color="#f15922" size={18} />
                      </div>
                    )}
                    <div className="flex items-center gap-1">
                      <div className="text-gray-400 text-sm">
                        {currencyMap.get(transaction.account.currency || Currency.USD)?.sign}{' '}
                      </div>
                      <p
                        className={cn(
                          'font-semibold',
                          transaction.amount > 0 ? 'text-green-500/90' : 'text-red-500/90'
                        )}
                      >
                        {transaction.amount > 0 ? '+' + transaction.amount : transaction.amount}
                      </p>
                    </div>
                    <Chip color="primary" variant="faded">
                      {transaction.category?.name}
                    </Chip>
                  </div>
                  <p className="text-gray-400">{format(transaction.date, 'dd MMM, yyyy')}</p>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-400 italic">No transactions in this period</p>
          )}
        </CardBody>
      </Card>
      <Card className="w-full">
        <CardHeader>
          <p className="card-title">Statistic</p>
        </CardHeader>
        <CardBody>
          {!transactionData || !transactionData?.transactions.length ? (
            <p className="text-gray-400 italic">No statistic in this period</p>
          ) : (
            <div className="flex flex-col gap-x-4 gap-y-6 w-full">
              {transactionData.income.count > 0 ? (
                <div className="flex gap-2 justify-between items-center w-full">
                  <p>Total incomes</p>
                  <div className="flex gap-2">
                    <Chip radius="md" color="primary">
                      {transactionData.income.count}
                    </Chip>
                    <span> in </span>
                    <Chip radius="md" color="secondary">
                      {transactionData.income.uniqueCategoriesCount || 0}
                    </Chip>
                    <span> categories</span>
                  </div>
                </div>
              ) : (
                <p className="text-gray-400 italic">No incomes in this period</p>
              )}
              {transactionData.expense.count > 0 ? (
                <div className="flex gap-2 justify-between items-center w-full">
                  <p>Total expenses</p>
                  <div className="flex gap-2">
                    <Chip radius="md" color="danger">
                      {transactionData.expense.count}
                    </Chip>
                    <span> in </span>
                    <Chip radius="md" color="secondary">
                      {transactionData.expense.uniqueCategoriesCount || 0}
                    </Chip>
                    <span> categories</span>
                  </div>
                </div>
              ) : (
                <p className="text-gray-400 italic">No expenses in this period</p>
              )}
              {minMaxTransaction?.max && (
                <div className="flex gap-2 justify-between items-center">
                  <span>Max income: </span>
                  <div className="flex gap-2 sm:gap-4 items-center">
                    <p className="text-gray-400">{format(minMaxTransaction.max.date, 'dd MMM')}</p>
                    <Chip radius="md" color="primary">
                      {currencyMap.get(minMaxTransaction.max.account.currency || Currency.USD)?.sign}{' '}
                      {minMaxTransaction.max.amount}
                    </Chip>
                  </div>
                </div>
              )}
              {minMaxTransaction?.min && (
                <div className="flex gap-2 justify-between items-center">
                  <span>Max expense: </span>
                  <div className="flex gap-2 sm:gap-4 items-center">
                    <p className="text-gray-400">{format(minMaxTransaction.min.date, 'dd MMM')}</p>
                    <Chip radius="md" color="danger">
                      {currencyMap.get(minMaxTransaction.min.account.currency || Currency.USD)?.sign}{' '}
                      {minMaxTransaction.min.amount}
                    </Chip>
                  </div>
                </div>
              )}
              {period && (
                <div className="flex gap-2 justify-between items-center">
                  <span>Period: </span>
                  <Chip radius="md" color="secondary">
                    {period} days
                  </Chip>
                </div>
              )}
            </div>
          )}
        </CardBody>
      </Card>
    </div>
  );
};
