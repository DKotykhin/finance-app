'use client';

import React, { useEffect, useMemo, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Autocomplete, AutocompleteItem, DateRangePicker, Skeleton } from '@nextui-org/react';
import { RangeValue } from '@react-types/shared';
import { DateValue } from '@react-types/datepicker';
import { addDays, differenceInDays, subDays, isToday } from 'date-fns';

import { getAccounts } from '@/actions/Account/_index';
import { getTransactionsByCategory, getTransactionsWithStats } from '@/actions/Transaction/_index';
import { getUserSettings } from '@/actions/UserSettings/getUserSettings';
import { valueToDate, dateToValue } from '@/utils/_index';
import { useAccountStore } from '@/store/accountSlice';

import { MainCards } from './mainCards';
import { TransactionsCard } from './transactionsCard';
import { CategoriesCard } from './categoriesCard';
import { StatsCards } from './statsCards';

export const Dashboard: React.FC<{ userId: string | null }> = ({ userId }) => {
  const { accountId, setId } = useAccountStore();

  const { data: userSettingsData, isLoading: isUserSettingsLoading } = useQuery({
    enabled: !!userId,
    queryKey: ['userSettings'],
    queryFn: () => getUserSettings({ userId: userId as string }),
  });

  const [dateValue, setDateValue] = useState<RangeValue<DateValue>>({
    start: dateToValue(subDays(new Date(), userSettingsData?.dashboardPeriod || 30)),
    end: dateToValue(new Date()),
  });

  useEffect(() => {
    console.log(`new Date: ${new Date()}`);
    console.log(`dateValue.end: ${dateValue.end}`);
    console.log(`valueToDate: ${valueToDate(dateValue.end)}`);
  }, [dateValue.end]);

  const period = useMemo(() => {
    return differenceInDays(valueToDate(dateValue.end), valueToDate(dateValue.start));
  }, [dateValue]);

  const { data: accountData, isLoading: isAccountLoading } = useQuery({
    enabled: !!userId,
    queryKey: ['accounts'],
    queryFn: () => getAccounts(userId as string),
  });

  useEffect(() => {
    if (!accountId) {
      const defaultAccount = accountData?.find((account) => account.isDefault);
      defaultAccount && setId(defaultAccount.id);
    }
  }, [accountData, accountId, setId]);

  const { data: transactionData, isLoading: isTransactionLoading } = useQuery({
    enabled: !!accountId,
    queryKey: ['transactionsWithStat', dateValue, accountId],
    queryFn: () =>
      getTransactionsWithStats({
        accountId: accountId,
        from: valueToDate(dateValue.start),
        to: valueToDate(dateValue.end),
      }),
  });

  const { data: previousTransactionData, isLoading: isPreviousTransactionLoading } = useQuery({
    enabled: !!accountId && period > 0,
    queryKey: ['previousTransactionsWithStat', dateValue, accountId],
    queryFn: () =>
      getTransactionsWithStats({
        accountId: accountId,
        from: addDays(subDays(valueToDate(dateValue.start), period), -1),
        to: addDays(subDays(valueToDate(dateValue.end), period), -1),
      }),
  });

  const { data: transactionByCategoryData } = useQuery({
    enabled: !!accountId,
    queryKey: ['transactionsByCategory', dateValue, accountId],
    queryFn: () =>
      getTransactionsByCategory({
        accountId: accountId,
        from: valueToDate(dateValue.start),
        to: valueToDate(dateValue.end),
      }),
  });

  const { data: previousTransactionByCategoryData } = useQuery({
    enabled: !!accountId,
    queryKey: ['previousTransactionsByCategory', dateValue, accountId],
    queryFn: () =>
      getTransactionsByCategory({
        accountId: accountId,
        from: addDays(subDays(valueToDate(dateValue.start), period), -1),
        to: addDays(subDays(valueToDate(dateValue.end), period), -1),
      }),
  });

  const currentAccount = useMemo(() => {
    return accountData?.find((account) => account.id === accountId);
  }, [accountData, accountId]);

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
              selectedKey={accountId}
              onSelectionChange={(key) => setId(key as string)}
            >
              {(account) => <AutocompleteItem key={account.id}>{account.accountName}</AutocompleteItem>}
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
                {isToday(valueToDate(dateValue.end)) ? `last ${period} days selected` : `${period} days selected`}
              </p>
            </div>
          </div>
          {isTransactionLoading || isPreviousTransactionLoading ? (
            <div className="flex flex-wrap lg:flex-nowrap gap-4 justify-between mt-8">
              <Skeleton className="w-full h-36 rounded-lg bg-slate-100"></Skeleton>
              <Skeleton className="w-full h-36 rounded-lg bg-slate-100"></Skeleton>
              <Skeleton className="w-full h-36 rounded-lg bg-slate-100"></Skeleton>
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
                  userSettingsData={userSettingsData}
                  isUserSettingsLoading={isUserSettingsLoading}
                />
                <CategoriesCard
                  transactionByCategoryData={transactionByCategoryData}
                  previousTransactionByCategoryData={previousTransactionByCategoryData}
                  userSettingsData={userSettingsData}
                  isUserSettingsLoading={isUserSettingsLoading}
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
