'use client';

import React, { useMemo } from 'react';

import { Card, CardBody, CardHeader, Chip } from '@nextui-org/react';
import { TrendingDown, TrendingUp } from 'lucide-react';
import { format, startOfDay } from 'date-fns';
import { Currency } from '@prisma/client';

import type { TransactionsWithStats } from '@/actions/Transaction/_index';
import { cn, currencyMap } from '@/utils/_index';

interface StatsCardsProps {
  transactionData?: TransactionsWithStats;
}

export const StatsCards: React.FC<StatsCardsProps> = ({ transactionData }) => {
  const lastTransactions = useMemo(() => {
    if (!transactionData) return [];
    const sortedData = [...transactionData?.transactions].sort((a, b) => b.date.getTime() - a.date.getTime());

    return sortedData.slice(0, 5);
  }, [transactionData]);

  const minMaxTransaction = useMemo(() => {
    if (!transactionData) return {};
    const sortedData = [...transactionData?.transactions].sort((a, b) => a.amount - b.amount);

    return {
      min: sortedData[0]?.amount < 0 ? sortedData[0] : null,
      max: sortedData[sortedData.length - 1]?.amount > 0 ? sortedData[sortedData.length - 1] : null,
    };
  }, [transactionData]);

  const todaysBallance = useMemo(() => {
    if (!transactionData) return {};

    const value = transactionData.transactions
      .filter(transaction => transaction.date > startOfDay(new Date()))
      .reduce((acc, transaction) => acc + transaction.amount, 0);

    const currency = transactionData.transactions[0]?.account.currency || Currency.USD;
    const isHideDecimal = transactionData.transactions[0]?.account.hideDecimal;
    const newValue = isHideDecimal ? Math.round(value) : Math.round(value * 100) / 100;

    return { value: newValue, currency };
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
                  <p className="sm:hidden italic text-sm text-gray-600">{transaction.notes}</p>
                  <div className="flex gap-3 sm:gap-6 items-center justify-between">
                    <div className="flex gap-3 sm:gap-6 items-center">
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
                          {transaction.account.hideDecimal
                            ? transaction.amount > 0
                              ? '+' + Math.round(transaction.amount)
                              : Math.round(transaction.amount)
                            : transaction.amount > 0
                              ? '+' + transaction.amount
                              : transaction.amount}
                        </p>
                      </div>
                    </div>
                    <Chip color="primary" variant="faded">
                      {transaction.category?.categoryName || 'Uncategorized'}
                    </Chip>
                    <p className="hidden sm:flex italic text-sm text-gray-600">{transaction.notes}</p>
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
              <div className="flex gap-2 justify-between items-center">
                <span>Today&apos;s balance: </span>
                {todaysBallance?.value ? (
                  <Chip radius="md" color={todaysBallance.value > 0 ? 'primary' : 'danger'}>
                    {currencyMap.get(todaysBallance.currency || Currency.USD)?.sign} {todaysBallance.value}
                  </Chip>
                ) : (
                  <p className="text-gray-400 italic text-sm">No transactions today</p>
                )}
              </div>
              {minMaxTransaction?.max && (
                <div className="flex gap-2 justify-between items-center">
                  <span>Max income: </span>
                  <div className="flex gap-2 sm:gap-4 items-center">
                    <p className="text-gray-400">{format(minMaxTransaction.max.date, 'dd MMM')}</p>
                    <Chip radius="md" color="primary">
                      {currencyMap.get(minMaxTransaction.max.account.currency || Currency.USD)?.sign}{' '}
                      {minMaxTransaction.max.account.hideDecimal
                        ? Math.round(minMaxTransaction.max.amount)
                        : minMaxTransaction.max.amount}
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
                      {minMaxTransaction.min.account.hideDecimal
                        ? Math.round(minMaxTransaction.min.amount)
                        : minMaxTransaction.min.amount}
                    </Chip>
                  </div>
                </div>
              )}
              {transactionData.income.count > 0 ? (
                <div className="flex gap-2 justify-between items-center w-full">
                  <p>Total incomes</p>
                  <div className="flex gap-2">
                    <Chip radius="md" color="primary">
                      {transactionData.income.count}
                    </Chip>
                    <span className="text-gray-400"> in </span>
                    <Chip radius="md" color="secondary">
                      {transactionData.income.uniqueCategoriesCount || 0}
                    </Chip>
                    <span className="text-gray-400"> categories</span>
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
                    <span className="text-gray-400"> in </span>
                    <Chip radius="md" color="secondary">
                      {transactionData.expense.uniqueCategoriesCount || 0}
                    </Chip>
                    <span className="text-gray-400"> categories</span>
                  </div>
                </div>
              ) : (
                <p className="text-gray-400 italic">No expenses in this period</p>
              )}
            </div>
          )}
        </CardBody>
      </Card>
    </div>
  );
};
