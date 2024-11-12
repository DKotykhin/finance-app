'use client';

import React, { useEffect, useMemo } from 'react';

import { useQuery } from '@tanstack/react-query';
import { Autocomplete, AutocompleteItem, DateRangePicker, Skeleton } from '@nextui-org/react';
import { addDays, differenceInDays, subDays, isToday } from 'date-fns';

import { getTransactionsByCategory, getTransactionsWithStats } from '@/actions';
import { valueToDate, dateToValue } from '@/utils';
import { useDashboardStore } from '@/store';
import { useFetchAccount, useFetchSettings } from '@/hooks';

import { MainCards } from './mainCards';
import { TransactionsCard } from './transactionsCard';
import { CategoriesCard } from './categoriesCard';
import { StatsCards } from './statsCards';

export const Dashboard: React.FC<{ userId: string | null }> = ({ userId }) => {
  const { accountId, setAccountId, dateValue, setDateValue } = useDashboardStore();

  const currentPeriod = useMemo(() => {
    return {
      start: valueToDate(dateValue.start),
      end: valueToDate(dateValue.end),
    };
  }, [dateValue]);

  const periodInDays = useMemo(() => {
    return differenceInDays(currentPeriod.end, currentPeriod.start);
  }, [currentPeriod]);

  const previousPeriod = useMemo(() => {
    return {
      start: addDays(subDays(currentPeriod.start, periodInDays), -1),
      end: addDays(subDays(currentPeriod.end, periodInDays), -1),
    };
  }, [currentPeriod, periodInDays]);

  const { accounts } = useFetchAccount(!!userId);
  const { userSettings } = useFetchSettings(!!userId);

  useEffect(() => {
    if (!accountId) {
      const defaultAccount = accounts.data?.find(account => account.isDefault);

      defaultAccount && setAccountId(defaultAccount.id);
    }
  }, [accounts.data, accountId, setAccountId]);

  useEffect(() => {
    if (!dateValue.start && !dateValue.end && !userSettings.isLoading) {
      setDateValue({
        start: dateToValue(subDays(new Date(), (userSettings.data?.dashboardPeriod ?? 30) - 1)),
        end: dateToValue(new Date()),
      });
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userSettings.data?.dashboardPeriod, userSettings.isLoading]);

  const { data: transactionData, isLoading: isTransactionLoading } = useQuery({
    enabled: !!accountId,
    queryKey: ['transactionsWithStat', dateValue, accountId],
    queryFn: () =>
      getTransactionsWithStats({
        accountId: accountId,
        from: currentPeriod.start,
        to: currentPeriod.end,
      }),
  });

  const { data: previousTransactionData, isLoading: isPreviousTransactionLoading } = useQuery({
    enabled: !!accountId && periodInDays > 0,
    queryKey: ['previousTransactionsWithStat', dateValue, accountId],
    queryFn: () =>
      getTransactionsWithStats({
        accountId: accountId,
        from: previousPeriod.start,
        to: previousPeriod.end,
      }),
  });

  const { data: transactionByCategoryData } = useQuery({
    enabled: !!accountId,
    queryKey: ['transactionsByCategory', dateValue, accountId],
    queryFn: () =>
      getTransactionsByCategory({
        accountId: accountId,
        from: currentPeriod.start,
        to: currentPeriod.end,
      }),
  });

  const { data: previousTransactionByCategoryData } = useQuery({
    enabled: !!accountId,
    queryKey: ['previousTransactionsByCategory', dateValue, accountId],
    queryFn: () =>
      getTransactionsByCategory({
        accountId: accountId,
        from: previousPeriod.start,
        to: previousPeriod.end,
      }),
  });

  const currentAccount = useMemo(() => {
    return accounts.data?.find(account => account.id === accountId);
  }, [accounts.data, accountId]);

  return (
    <div className="-mt-44">
      {accounts.isLoading ? (
        <div className="flex flex-col md:flex-row gap-4">
          <Skeleton className="w-full sm:w-[220px] h-14 rounded-lg bg-slate-100" />
          <Skeleton className="w-full sm:w-[280px] h-14 rounded-lg bg-slate-100" />
        </div>
      ) : accounts.data && accounts.data.length > 0 ? (
        <>
          <div className="flex flex-col md:flex-row gap-4">
            <Autocomplete
              defaultItems={accounts.data}
              label="Your accounts"
              placeholder="Search an account"
              className="w-full sm:max-w-[220px]"
              selectedKey={accountId}
              onSelectionChange={key => setAccountId(key as string)}
            >
              {account => <AutocompleteItem key={account.id}>{account.accountName}</AutocompleteItem>}
            </Autocomplete>
            <div>
              <DateRangePicker
                label="Period"
                visibleMonths={2}
                className="w-full sm:max-w-[280px]"
                value={dateValue}
                onChange={setDateValue}
              />
              <p className="text-xs italic text-blue-200 mt-1 ml-1">
                {isToday(currentPeriod.end)
                  ? `last ${periodInDays + 1} days selected`
                  : `${periodInDays + 1} days selected`}
              </p>
            </div>
          </div>
          {isTransactionLoading || isPreviousTransactionLoading ? (
            <div className="flex flex-wrap lg:flex-nowrap gap-4 justify-between mt-8">
              <Skeleton className="w-full h-36 rounded-lg bg-slate-100" />
              <Skeleton className="w-full h-36 rounded-lg bg-slate-100" />
              <Skeleton className="w-full h-36 rounded-lg bg-slate-100" />
            </div>
          ) : accountId ? (
            <>
              <MainCards
                transactionData={transactionData}
                previousTransactionData={previousTransactionData}
                dateValue={dateValue}
                currentAccount={currentAccount}
              />
              <StatsCards transactionData={transactionData} />
              <div className="flex flex-wrap lg:flex-nowrap gap-4 justify-between my-8">
                <TransactionsCard
                  transactionData={transactionData}
                  previousTransactionData={previousTransactionData}
                  userSettingsData={userSettings.data}
                  isUserSettingsLoading={userSettings.isLoading}
                  currentPeriod={currentPeriod}
                  previousPeriod={previousPeriod}
                />
                <CategoriesCard
                  transactionByCategoryData={transactionByCategoryData}
                  previousTransactionByCategoryData={previousTransactionByCategoryData}
                  userSettingsData={userSettings.data}
                  isUserSettingsLoading={userSettings.isLoading}
                  currentPeriod={currentPeriod}
                  previousPeriod={previousPeriod}
                />
              </div>
            </>
          ) : (
            <div className="text-white mt-6">Please select an account!</div>
          )}
        </>
      ) : (
        <div className="text-white">No accounts found</div>
      )}
    </div>
  );
};
