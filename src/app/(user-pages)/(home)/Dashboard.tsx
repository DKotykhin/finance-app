'use client';

import React, { useEffect, useMemo, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import {
  Autocomplete,
  AutocompleteItem,
  Card,
  CardBody,
  CardFooter,
  CardHeader,
  DateRangePicker,
  Skeleton,
} from '@nextui-org/react';
import { RangeValue } from '@react-types/shared';
import { DateValue } from '@react-types/datepicker';
import { addDays, differenceInDays, format, subDays } from 'date-fns';
import { HandCoins, TrendingDown, TrendingUp } from 'lucide-react';
import { Currency } from '@prisma/client';

import { getAccounts } from '@/actions/Account/_index';
import { getTransactions } from '@/actions/Transaction/_index';
import { valueToDate, currencyMap, dateToValue, cn } from '@/utils/_index';

export const Dashboard: React.FC<{ userId: string | null }> = ({ userId }) => {
  const [accountValue, setAccountValue] = useState<any>();

  const [dateValue, setDateValue] = useState<RangeValue<DateValue>>({
    start: dateToValue(subDays(new Date(), 30)),
    end: dateToValue(new Date()),
  });

  const period = useMemo(() => {
    return differenceInDays(valueToDate(dateValue.end), valueToDate(dateValue.start));
  }, [dateValue]);

  const { data: accountData, isLoading: isAccountLoading } = useQuery({
    enabled: !!userId,
    queryKey: ['accounts'],
    queryFn: () => getAccounts(userId as string),
  });

  useEffect(() => {
    const defaultAccount = accountData?.find((account) => account.isDefault);
    defaultAccount && setAccountValue(defaultAccount.id);
  }, [accountData]);

  const { data: transactionData, isLoading: isTransactionLoading } = useQuery({
    enabled: !!accountValue,
    queryKey: ['transactions', dateValue, accountValue],
    queryFn: () =>
      getTransactions({
        accountIds: [accountValue],
        from: valueToDate(dateValue.start),
        to: valueToDate(dateValue.end),
      }),
  });

  const { data: previousTransactionData, isLoading: isPreviousTransactionLoading } = useQuery({
    enabled: !!accountValue && period > 0,
    queryKey: ['previousTransactions', dateValue, accountValue],
    queryFn: () =>
      getTransactions({
        accountIds: [accountValue],
        from: addDays(subDays(valueToDate(dateValue.start), period), -1),
        to: addDays(subDays(valueToDate(dateValue.end), period), -1),
      }),
  });

  const currentAccount = useMemo(() => {
    return accountData?.find((account) => account.id === accountValue);
  }, [accountData, accountValue]);

  const totalIncome = useMemo(() => {
    return transactionData?.reduce((acc, transaction) => {
      const totalIncome = transaction.amount > 0 ? acc + transaction.amount : acc;
      return currentAccount?.hideDecimal ? Math.round(totalIncome) : Math.round(totalIncome * 100) / 100;
    }, 0);
  }, [transactionData, currentAccount]);

  const totalPreviousIncome = useMemo(() => {
    return previousTransactionData?.reduce((acc, transaction) => {
      const totalIncome = transaction.amount > 0 ? acc + transaction.amount : acc;
      return currentAccount?.hideDecimal ? Math.round(totalIncome) : Math.round(totalIncome * 100) / 100;
    }, 0);
  }, [previousTransactionData, currentAccount]);

  const totalExpenses = useMemo(() => {
    return transactionData?.reduce((acc, transaction) => {
      const totalExpenses = transaction.amount < 0 ? acc + transaction.amount : acc;
      return currentAccount?.hideDecimal ? Math.round(totalExpenses) : Math.round(totalExpenses * 100) / 100;
    }, 0);
  }, [transactionData, currentAccount]);

  const totalPreviousExpenses = useMemo(() => {
    return previousTransactionData?.reduce((acc, transaction) => {
      const totalExpenses = transaction.amount < 0 ? acc + transaction.amount : acc;
      return currentAccount?.hideDecimal ? Math.round(totalExpenses) : Math.round(totalExpenses * 100) / 100;
    }, 0);
  }, [previousTransactionData, currentAccount]);

  const totalRemaining = useMemo(() => {
    const totalRemaining = (totalIncome ? totalIncome : 0) + (totalExpenses ? totalExpenses : 0);
    return Math.round(totalRemaining * 100) / 100;
  }, [totalIncome, totalExpenses]);

  const totalPreviousRemaining = useMemo(() => {
    const totalRemaining =
      (totalPreviousIncome ? totalPreviousIncome : 0) + (totalPreviousExpenses ? totalPreviousExpenses : 0);
    return Math.round(totalRemaining * 100) / 100;
  }, [totalPreviousIncome, totalPreviousExpenses]);

  const userMessage = (current?: number, previous?: number): React.ReactElement => {
    if (!current) return <p className="text-sm text-gray-400">No data in current period</p>;
    if (!previous) return <p className="text-sm text-gray-400">No data in previous period</p>;
    const percentage = Math.abs(Math.round((previous / current) * 100));
    if (
      (current > 0 && previous < 0) ||
      (current > 0 && previous > 0 && previous > current) ||
      (current < 0 && previous < 0 && previous < current)
    ) {
      return <p className="text-sm text-green-500">{`+ ${percentage}% from last period`}</p>;
    }
    if (
      (current < 0 && previous > 0) ||
      (current < 0 && previous < 0 && previous > current) ||
      (current > 0 && previous > 0 && previous < current)
    ) {
      return <p className="text-sm text-red-500">{`- ${percentage}% from last period`}</p>;
    }
    return <></>;
  };

  const cardArray = [
    {
      title: 'Remaining',
      icon: <HandCoins color="#2563eb" />,
      iconBackground: 'bg-blue-500/10',
      value: totalRemaining,
      previous: totalPreviousRemaining,
    },
    {
      title: 'Income',
      icon: <TrendingUp color="#22c55e" />,
      iconBackground: 'bg-green-500/10',
      value: totalIncome,
      previous: totalPreviousIncome,
    },
    {
      title: 'Expenses',
      icon: <TrendingDown color="#f15922" />,
      iconBackground: 'bg-red-500/10',
      value: totalExpenses,
      previous: totalPreviousExpenses,
    },
  ];

  return (
    <section className="-mt-44">
      {isAccountLoading ? (
        <div className="flex flex-col md:flex-row gap-4">
          <Skeleton className="w-full sm:w-[220px] h-14 rounded-lg bg-slate-100"></Skeleton>
          <Skeleton className="w-full sm:w-[280px] h-14 rounded-lg bg-slate-100"></Skeleton>
        </div>
      ) : accountData && accountData.length > 0 ? (
        <>
          <div className="flex flex-col md:flex-row gap-4">
            <Autocomplete
              defaultItems={accountData}
              label="Your accounts"
              placeholder="Search an account"
              className="w-full sm:max-w-[220px]"
              selectedKey={accountValue}
              onSelectionChange={setAccountValue}
            >
              {(account) => <AutocompleteItem key={account.id}>{account.accountName}</AutocompleteItem>}
            </Autocomplete>
            <DateRangePicker
              label="Period"
              visibleMonths={2}
              className="w-full sm:max-w-[280px]"
              value={dateValue}
              onChange={setDateValue}
            />
          </div>
          {isTransactionLoading ? (
            <div className="flex flex-wrap lg:flex-nowrap gap-4 justify-between mt-8">
              <Skeleton className="w-full h-36 rounded-lg bg-slate-100"></Skeleton>
              <Skeleton className="w-full h-36 rounded-lg bg-slate-100"></Skeleton>
              <Skeleton className="w-full h-36 rounded-lg bg-slate-100"></Skeleton>
            </div>
          ) : (
            <div className="flex flex-wrap lg:flex-nowrap gap-4 justify-between mt-8">
              {cardArray.map((card, index) => (
                <Card key={index} className="w-full">
                  <CardHeader>
                    <div className="w-full flex items-center justify-between">
                      <div>
                        <p className="text-2xl font-semibold">{card.title}</p>
                        <p className="text-gray-400 text-sm mt-2">
                          {format(valueToDate(dateValue.start), 'dd/MM/yyyy')} -{' '}
                          {format(valueToDate(dateValue.end), 'dd/MM/yyyy')}
                        </p>
                      </div>
                      <div className={cn('p-2 rounded-lg', card.iconBackground)}>{card.icon}</div>
                    </div>
                  </CardHeader>
                  <CardBody>
                    <p>
                      <span className="text-2xl text-gray-400">
                        {currencyMap.get(currentAccount?.currency || Currency.USD)?.sign}{' '}
                      </span>
                      <span className="font-semibold text-3xl">{card.value}</span>
                    </p>
                  </CardBody>
                  <CardFooter>
                    {isPreviousTransactionLoading ? (
                      <Skeleton className="w-full h-4 rounded-lg bg-slate-100"></Skeleton>
                    ) : (
                      userMessage(card.value, card.previous)
                    )}
                  </CardFooter>
                </Card>
              ))}
            </div>
          )}
        </>
      ) : (
        <div className="text-white">No accounts found</div>
      )}
    </section>
  );
};
