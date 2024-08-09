import React from 'react';
import { Card, CardBody, CardFooter, CardHeader } from '@nextui-org/react';
import { format } from 'date-fns';
import { HandCoins, TrendingDown, TrendingUp } from 'lucide-react';
import CountUp from 'react-countup';
import { RangeValue } from '@react-types/shared';
import { DateValue } from '@react-types/datepicker';
import { Currency } from '@prisma/client';

import { valueToDate, currencyMap, cn } from '@/utils/_index';
import { TransactionsWithStats } from '@/actions/Transaction/_index';
import { ExtendedAccount } from '@/actions/Account/_index';

import { CompareMessage } from './CompareMessage';

interface MainCardsProps {
  transactionData?: TransactionsWithStats;
  previousTransactionData?: TransactionsWithStats;
  dateValue: RangeValue<DateValue>;
  currentAccount?: ExtendedAccount;
}

export const MainCards: React.FC<MainCardsProps> = ({
  transactionData,
  previousTransactionData,
  dateValue,
  currentAccount,
}) => {
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
      value: transactionData?.income.amount,
      previous: previousTransactionData?.income.amount,
    },
    {
      title: 'Expenses',
      icon: <TrendingDown color="#f15922" />,
      iconBackground: 'bg-red-500/10',
      value: transactionData?.expense.amount,
      previous: previousTransactionData?.expense.amount,
    },
  ];

  return (
    <div className="flex flex-wrap lg:flex-nowrap gap-4 justify-between mt-8">
      {cardArray.map((card, index) => (
        <Card key={index} className="w-full">
          <CardHeader>
            <div className="w-full flex items-center justify-between">
              <div>
                <p className="card-title">{card.title}</p>
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
            <CompareMessage current={card.value} previous={card.previous} />
          </CardFooter>
        </Card>
      ))}
    </div>
  );
};
