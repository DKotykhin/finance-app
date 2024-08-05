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
  Radio,
  RadioGroup,
  Select,
  Selection,
  SelectItem,
  Skeleton,
} from '@nextui-org/react';
import { RangeValue } from '@react-types/shared';
import { DateValue } from '@react-types/datepicker';
import { addDays, differenceInDays, format, subDays } from 'date-fns';
import { HandCoins, TrendingDown, TrendingUp, BarChart3, LineChart, AreaChart } from 'lucide-react';
import { Currency } from '@prisma/client';
import CountUp from 'react-countup';

import { getAccounts } from '@/actions/Account/_index';
import { getTransactionsByCategory, getTransactionsWithStats } from '@/actions/Transaction/_index';
import { valueToDate, currencyMap, dateToValue, cn } from '@/utils/_index';

import { CompareMessage } from './CompareMessage';
import { TransactionChart } from './TransactionsChart';
import { ChartView, Period } from './const';
import { CategoriesChart } from './CategoriesChart';

export const Dashboard: React.FC<{ userId: string | null }> = ({ userId }) => {
  const [accountValue, setAccountValue] = useState<any>();
  const [selectedPeriod, setSelectedPeriod] = useState<Period>(Period.Current);
  const [selectedCategoryPeriod, setSelectedCategoryPeriod] = useState<Period>(Period.Current);
  const [dateValue, setDateValue] = useState<RangeValue<DateValue>>({
    start: dateToValue(subDays(new Date(), 30)),
    end: dateToValue(new Date()),
  });
  const [chartView, setChartView] = useState<Selection>(new Set([ChartView.BarChart]));

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

  const cardArray = [
    {
      title: 'Remaining',
      icon: <HandCoins color="#2563eb" />,
      iconBackground: 'bg-blue-500/10',
      value: transactionData?.remaining,
      previous: previousTransactionData?.remaining,
    },
    {
      title: 'Income',
      icon: <TrendingUp color="#22c55e" />,
      iconBackground: 'bg-green-500/10',
      value: transactionData?.income,
      previous: previousTransactionData?.income,
    },
    {
      title: 'Expenses',
      icon: <TrendingDown color="#f15922" />,
      iconBackground: 'bg-red-500/10',
      value: transactionData?.expense,
      previous: previousTransactionData?.expense,
    },
  ];

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
                          {format(valueToDate(dateValue.start), 'dd MMM')}
                          {valueToDate(dateValue.start).getFullYear() !== valueToDate(dateValue.end).getFullYear() && (
                            <span>, {valueToDate(dateValue.start).getFullYear()}</span>
                          )}{' '}
                          - {format(valueToDate(dateValue.end), 'dd MMM, yyyy')}
                        </p>
                      </div>
                      <div className={cn('p-2 rounded-lg', card.iconBackground)}>{card.icon}</div>
                    </div>
                  </CardHeader>
                  <CardBody>
                    <div className="flex gap-1 items-end">
                      <div className="text-2xl text-gray-400">
                        {currencyMap.get(currentAccount?.currency || Currency.USD)?.sign}{' '}
                      </div>
                      <div className="font-semibold text-3xl">
                        <CountUp
                          start={card.previous || 0}
                          end={card.value || 0}
                          duration={1}
                          separator=","
                          decimals={currentAccount?.hideDecimal ? 0 : 2}
                        />
                      </div>
                    </div>
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
          <div className="flex flex-wrap lg:flex-nowrap gap-4 justify-between my-8">
            <Card className="w-full lg:w-[calc(66.67%+6px)]">
              <CardHeader>
                <div className="w-full flex flex-col gap-6 sm:flex-row sm:justify-between sm:items-end">
                  <div>
                    <p className="text-2xl font-semibold mb-4">Transactions</p>
                    <RadioGroup
                      label="Select period"
                      orientation="horizontal"
                      value={selectedPeriod}
                      onValueChange={(value: string) => setSelectedPeriod(value as Period)}
                    >
                      <Radio value={Period.Current}>Current</Radio>
                      <Radio value={Period.Previous}>Previous</Radio>
                    </RadioGroup>
                  </div>
                  <Select
                    label="Select chart view"
                    className="w-full sm:max-w-[180px]"
                    selectedKeys={chartView}
                    onSelectionChange={setChartView}
                  >
                    <SelectItem key={ChartView.BarChart} startContent={<BarChart3 color="#2563eb" />}>
                      Bar Chart
                    </SelectItem>
                    <SelectItem key={ChartView.LineChart} startContent={<LineChart color="#2563eb" />}>
                      Line Chart
                    </SelectItem>
                    <SelectItem key={ChartView.AreaChart} startContent={<AreaChart color="#2563eb" />}>
                      Area Chart
                    </SelectItem>
                  </Select>
                </div>
              </CardHeader>
              <CardBody className="pl-0 pb-6">
                <TransactionChart
                  currentTransactions={transactionData?.transactions || []}
                  previousTransactions={previousTransactionData?.transactions || []}
                  selectedPeriod={selectedPeriod}
                  selectedView={Array.from(chartView)[0] as ChartView}
                />
              </CardBody>
            </Card>
            <Card className="w-full lg:w-[calc(33.33%-6px)]">
              <CardHeader>
                <div>
                  <p className="text-2xl font-semibold mb-4">Categories</p>
                  <RadioGroup
                    label="Select period"
                    orientation="horizontal"
                    value={selectedCategoryPeriod}
                    onValueChange={(value: string) => setSelectedCategoryPeriod(value as Period)}
                  >
                    <Radio value={Period.Current}>Current</Radio>
                    <Radio value={Period.Previous}>Previous</Radio>
                  </RadioGroup>
                </div>
              </CardHeader>
              <CardBody>
                <CategoriesChart
                  currentTransactionByCategory={transactionByCategoryData}
                  previousTransactionByCategory={previousTransactionByCategoryData}
                  selectedPeriod={selectedCategoryPeriod}
                />
              </CardBody>
            </Card>
          </div>
        </>
      ) : (
        <div className="text-white">No accounts found</div>
      )}
    </div>
  );
};
