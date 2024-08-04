'use client';

import React, { useEffect, useMemo, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import {
  Autocomplete,
  AutocompleteItem,
  Card,
  CardBody,
  CardHeader,
  DateRangePicker,
  Skeleton,
} from '@nextui-org/react';
import { getLocalTimeZone, parseDate } from '@internationalized/date';
import { RangeValue } from '@react-types/shared';
import { DateValue } from '@react-types/datepicker';
import { format, subDays } from 'date-fns';
import { HandCoins, TrendingDown, TrendingUp } from 'lucide-react';
import { Currency } from '@prisma/client';

import { getAccounts } from '@/actions/Account/_index';
import { getTransactions } from '@/actions/Transaction/_index';
import { currencyMap } from '@/utils/currency';

export const Dashboard: React.FC<{ userId: string | null }> = ({ userId }) => {
  const [accountValue, setAccountValue] = useState<any>();

  const [dateValue, setDateValue] = useState<RangeValue<DateValue>>({
    start: parseDate(format(subDays(new Date(), 30), 'yyyy-MM-dd')),
    end: parseDate(format(new Date(), 'yyyy-MM-dd')),
  });

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
    enabled: !!accountData && !!accountValue,
    queryKey: ['transactions', dateValue, accountValue],
    queryFn: () =>
      getTransactions({
        accountIds: [accountValue],
        from: dateValue.start.toDate(getLocalTimeZone()),
        to: dateValue.end.toDate(getLocalTimeZone()),
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

  const totalExpenses = useMemo(() => {
    return transactionData?.reduce((acc, transaction) => {
      const totalExpenses = transaction.amount < 0 ? acc + transaction.amount : acc;
      return currentAccount?.hideDecimal ? Math.round(totalExpenses) : Math.round(totalExpenses * 100) / 100;
    }, 0);
  }, [transactionData, currentAccount]);

  const totalRemaining = useMemo(() => {
    const totalRemaining = (totalIncome ? totalIncome : 0) + (totalExpenses ? totalExpenses : 0);
    return Math.round(totalRemaining * 100) / 100;
  }, [totalIncome, totalExpenses]);

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
              <Card className="w-full">
                <CardHeader>
                  <div className="w-full flex items-center justify-between">
                    <div>
                      <p className="text-2xl font-semibold">Remaining</p>
                      <p className="text-gray-400 text-sm mt-2">
                        {format(dateValue.start.toDate(getLocalTimeZone()), 'dd/MM/yyyy')} -{' '}
                        {format(dateValue.end.toDate(getLocalTimeZone()), 'dd/MM/yyyy')}
                      </p>
                    </div>
                    <div className="bg-blue-500/10 p-2 rounded-lg">
                      <HandCoins color="#2563eb" />
                    </div>
                  </div>
                </CardHeader>
                <CardBody>
                  <p>
                    <span className="text-2xl text-gray-400">
                      {currencyMap.get(currentAccount?.currency || Currency.USD)?.sign}{' '}
                    </span>
                    <span className="font-semibold text-3xl">{totalRemaining}</span>
                  </p>
                </CardBody>
              </Card>
              <Card className="w-full">
                <CardHeader>
                  <div className="w-full flex items-center justify-between">
                    <div>
                      <p className="text-2xl font-semibold">Income</p>
                      <p className="text-gray-400 text-sm mt-2">
                        {format(dateValue.start.toDate(getLocalTimeZone()), 'dd/MM/yyyy')} -{' '}
                        {format(dateValue.end.toDate(getLocalTimeZone()), 'dd/MM/yyyy')}
                      </p>
                    </div>
                    <div className="bg-green-500/10 p-2 rounded-lg">
                      <TrendingUp color="#22c55e" />
                    </div>
                  </div>
                </CardHeader>
                <CardBody>
                  <p>
                    <span className="text-2xl text-gray-400">
                      {currencyMap.get(currentAccount?.currency || Currency.USD)?.sign}{' '}
                    </span>
                    <span className="font-semibold text-3xl">{totalIncome}</span>
                  </p>
                </CardBody>
              </Card>
              <Card className="w-full">
                <CardHeader>
                  <div className="w-full flex items-center justify-between">
                    <div>
                      <p className="text-2xl font-semibold">Expenses</p>
                      <p className="text-gray-400 text-sm mt-2">
                        {format(dateValue.start.toDate(getLocalTimeZone()), 'dd/MM/yyyy')} -{' '}
                        {format(dateValue.end.toDate(getLocalTimeZone()), 'dd/MM/yyyy')}
                      </p>
                    </div>
                    <div className="bg-red-500/10 p-2 rounded-lg">
                      <TrendingDown color="#f15922" />
                    </div>
                  </div>
                </CardHeader>
                <CardBody>
                  <p>
                    <span className="text-2xl text-gray-400">
                      {currencyMap.get(currentAccount?.currency || Currency.USD)?.sign}{' '}
                    </span>
                    <span className="font-semibold text-3xl">{totalExpenses}</span>
                  </p>
                </CardBody>
              </Card>
            </div>
          )}
        </>
      ) : (
        <div className="text-white">No accounts found</div>
      )}
    </section>
  );
};
