'use client';

import React, { useEffect, useMemo, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Autocomplete, AutocompleteItem, DateRangePicker, Skeleton } from '@nextui-org/react';
import { RangeValue } from '@react-types/shared';
import { DateValue } from '@react-types/datepicker';
import { addDays, differenceInDays, subDays } from 'date-fns';

import { getAccounts } from '@/actions/Account/_index';
import { getTransactionsByCategory, getTransactionsWithStats } from '@/actions/Transaction/_index';
import { valueToDate, dateToValue } from '@/utils/_index';

import { MainCards } from './mainCards/MainCards';
import { TransactionsCard } from './transactionsCard/TransactionsCard';
import { CategoriesCard } from './categoriesCard/CategoriesCard';
import { StatsCards } from './statsCards/StatsCards';

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

  const { data: transactionByCategoryData } = useQuery({
    enabled: !!accountValue,
    queryKey: ['transactionsByCategory', dateValue, accountValue],
    queryFn: () =>
      getTransactionsByCategory({
        accountId: accountValue,
        from: valueToDate(dateValue.start),
        to: valueToDate(dateValue.end),
      }),
  });

  const { data: previousTransactionByCategoryData } = useQuery({
    enabled: !!accountValue,
    queryKey: ['previousTransactionsByCategory', dateValue, accountValue],
    queryFn: () =>
      getTransactionsByCategory({
        accountId: accountValue,
        from: addDays(subDays(valueToDate(dateValue.start), period), -1),
        to: addDays(subDays(valueToDate(dateValue.end), period), -1),
      }),
  });

  const currentAccount = useMemo(() => {
    return accountData?.find((account) => account.id === accountValue);
  }, [accountData, accountValue]);

  return (
    <div className="-mt-44">
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
          {isTransactionLoading || isPreviousTransactionLoading ? (
            <div className="flex flex-wrap lg:flex-nowrap gap-4 justify-between mt-8">
              <Skeleton className="w-full h-36 rounded-lg bg-slate-100"></Skeleton>
              <Skeleton className="w-full h-36 rounded-lg bg-slate-100"></Skeleton>
              <Skeleton className="w-full h-36 rounded-lg bg-slate-100"></Skeleton>
            </div>
          ) : (
            <>
              <MainCards
                transactionData={transactionData}
                previousTransactionData={previousTransactionData}
                dateValue={dateValue}
                currentAccount={currentAccount}
              />
              <StatsCards transactionData={transactionData} period={period} />
              <div className="flex flex-wrap lg:flex-nowrap gap-4 justify-between my-8">
                <TransactionsCard transactionData={transactionData} previousTransactionData={previousTransactionData} />
                <CategoriesCard
                  transactionByCategoryData={transactionByCategoryData}
                  previousTransactionByCategoryData={previousTransactionByCategoryData}
                />
              </div>
            </>
          )}
        </>
      ) : (
        <div className="text-white">No accounts found</div>
      )}
    </div>
  );
};
