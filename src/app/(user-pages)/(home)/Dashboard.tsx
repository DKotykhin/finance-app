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
import { getTransactionsWithStats } from '@/actions/Transaction/_index';
import { valueToDate, currencyMap, dateToValue, cn } from '@/utils/_index';

import { CompareMessage } from './CompareMessage';

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
    queryKey: ['transactionsWithStat', dateValue, accountValue],
    queryFn: () =>
      getTransactionsWithStats({
        accountId: accountValue,
        from: valueToDate(dateValue.start),
        to: valueToDate(dateValue.end),
      }),
  });

  const { data: previousTransactionData, isLoading: isPreviousTransactionLoading } = useQuery({
    enabled: !!accountValue && period > 0,
    queryKey: ['previousTransactionsWithStat', dateValue, accountValue],
    queryFn: () =>
      getTransactionsWithStats({
        accountId: accountValue,
        from: addDays(subDays(valueToDate(dateValue.start), period), -1),
        to: addDays(subDays(valueToDate(dateValue.end), period), -1),
      }),
  });

  const currentAccount = useMemo(() => {
    return accountData?.find((account) => account.id === accountValue);
  }, [accountData, accountValue]);

  const cardArray = [
    {
      title: 'Remaining',
      icon: <HandCoins color="#2563eb" />,
      iconBackground: 'bg-blue-500/10',
      value: currentAccount?.hideDecimal
        ? transactionData?.remaining && Math.round(transactionData.remaining)
        : transactionData?.remaining,
      previous: previousTransactionData?.remaining,
    },
    {
      title: 'Income',
      icon: <TrendingUp color="#22c55e" />,
      iconBackground: 'bg-green-500/10',
      value: currentAccount?.hideDecimal
        ? transactionData?.income && Math.round(transactionData.income)
        : transactionData?.income,
      previous: previousTransactionData?.income,
    },
    {
      title: 'Expenses',
      icon: <TrendingDown color="#f15922" />,
      iconBackground: 'bg-red-500/10',
      value: currentAccount?.hideDecimal
        ? transactionData?.expense && Math.round(transactionData.expense)
        : transactionData?.expense,
      previous: previousTransactionData?.expense,
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
                      <CompareMessage current={card.value} previous={card.previous} />
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
