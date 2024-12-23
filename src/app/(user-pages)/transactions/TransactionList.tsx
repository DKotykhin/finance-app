'use client';

import React, { useState, useMemo, useCallback, useEffect } from 'react';

import {
  Button,
  DatePicker,
  Pagination,
  Select,
  SelectItem,
  Skeleton,
  Spinner,
  Table,
  TableHeader,
  TableColumn,
  TableBody,
  TableRow,
  TableCell,
  Tooltip,
  getKeyValue,
  useDisclosure,
} from '@nextui-org/react';
import { EyeIcon, Loader2, Pencil, Trash2, TriangleAlert } from 'lucide-react';
import { differenceInDays, format, subDays, isToday } from 'date-fns';
import { useUser } from '@clerk/nextjs';
import type { Selection } from '@nextui-org/react';

import type { DateValue } from '@internationalized/date';
import { parseAbsoluteToLocal } from '@internationalized/date';
import type { UserSettings } from '@prisma/client';
import { SortOrder } from '@prisma/client';

import type { ExtendedTransaction, TransactionCreate } from '@/actions';
import { cn, currencyMap, dateToValue, numberWithSpaces, rowsPerPageArray, valueToDate } from '@/utils';
import { useTransactionsStore } from '@/store';
import { useConfirm, useFetchAccount, useFetchCategory, useFetchTransaction } from '@/hooks';

import { columns } from './const';
import { TransactionModal } from './TransactionModal';
import { ViewModal } from './ViewModal';
import { AccountName } from '../accounts/AccountName';

interface TransactionListProps {
  userSettingsData?: UserSettings | null;
  isUserSettingsLoading: boolean;
  selectedKeysFn: (keys: any) => void;
  transactionListLengthFn: (length: number) => void;
}

interface SortDescriptor {
  column: (typeof columns)[number]['key'];
  direction: SortOrder;
}

export interface TransactionUpdate extends TransactionCreate {
  id: string;
}

export const TransactionList: React.FC<TransactionListProps> = ({
  selectedKeysFn,
  transactionListLengthFn,
  userSettingsData,
  isUserSettingsLoading,
}) => {
  const [updateTransaction, setUpdateTransaction] = useState<TransactionUpdate | null>(null);
  const [transaction, setTransaction] = useState<ExtendedTransaction | null>(null);
  const [selectedKeys, setSelectedKeys] = useState<Selection>(new Set());
  const [page, setPage] = useState(1);
  const [pages, setPages] = useState(1);
  const [transactionListLength, setTransactionListLength] = useState(0);

  const [sortDescriptor, setSortDescriptor] = useState<SortDescriptor>({
    column: userSettingsData?.transactionSortField || 'date',
    direction: userSettingsData?.transactionSortOrder || SortOrder.descending,
  });

  // to do: move to store
  const [dateValue, setDateValue] = useState<{ start: DateValue; end: DateValue }>({
    start: parseAbsoluteToLocal(subDays(new Date(), 30).toISOString()),
    end: parseAbsoluteToLocal(new Date().toISOString()),
  });

  const { isOpen: isOpenView, onOpen: onOpenView, onOpenChange: onOpenChangeView } = useDisclosure();
  const { isOpen: isOpenUpdate, onOpen: onOpenUpdate, onOpenChange: onOpenChangeUpdate } = useDisclosure();

  const {
    accountValue,
    categoryValue,
    startDate,
    endDate,
    rowsPerPage,
    setAccountValue,
    setCategoryValue,
    setStartDate,
    setEndDate,
    setRowsPerPage,
  } = useTransactionsStore();

  const [ConfirmModal, confirm] = useConfirm({
    title: 'Delete Transaction',
    message: 'Are you sure you want to delete this transaction?',
  });

  const { user } = useUser();
  const { accounts } = useFetchAccount(!!user?.id);
  const { categories } = useFetchCategory(!!user?.id);

  const { transactions, deleteTransaction } = useFetchTransaction({
    enabled: !!accounts.data,
    accountData: accounts.data,
    dateValue,
  });

  const periodInDays = useMemo(() => {
    return differenceInDays(valueToDate(dateValue.end), valueToDate(dateValue.start));
  }, [dateValue]);

  useEffect(() => {
    if (!rowsPerPage) setRowsPerPage(userSettingsData?.transactionRowsPerPage || '5');
  }, [rowsPerPage, setRowsPerPage, userSettingsData?.transactionRowsPerPage]);

  useEffect(() => {
    if (startDate) {
      setDateValue(v => ({ ...v, start: dateToValue(startDate) }));
    } else {
      setDateValue(v => ({
        ...v,
        start: parseAbsoluteToLocal(subDays(new Date(), (userSettingsData?.transactionPeriod ?? 30) - 1).toISOString()),
      }));
    }

    if (endDate) {
      setDateValue(v => ({ ...v, end: dateToValue(endDate) }));
    } else {
      setDateValue(v => ({ ...v, end: parseAbsoluteToLocal(new Date().toISOString()) }));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userSettingsData?.transactionPeriod]);

  useEffect(() => {
    if (userSettingsData?.transactionRowsPerPage) {
      setRowsPerPage(userSettingsData.transactionRowsPerPage);
    }
  }, [setRowsPerPage, userSettingsData?.transactionRowsPerPage]);

  useEffect(() => {
    transactionListLengthFn(transactionListLength);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [transactionListLength]);

  const handleClick = async (id: string) => {
    const ok = await confirm();

    if (ok) {
      deleteTransaction.mutateAsync(id);
    }
  };

  const updateClick = (transaction: TransactionUpdate) => {
    setUpdateTransaction(transaction);
    onOpenUpdate();
  };

  const onRowsPerPageChange = useCallback(
    (e: { target: { value: string } }) => {
      setRowsPerPage(e.target.value);
      setPage(1);
    },
    [setRowsPerPage]
  );

  const onSelectedKeys = (keys: Selection) => {
    setSelectedKeys(keys);
    selectedKeysFn(keys === 'all' ? tableContent?.map(transaction => transaction.id) : Array.from(keys));
  };

  const onChangeStartDateValue = (value: DateValue) => {
    setDateValue(v => ({ ...v, start: value }));
    setStartDate(valueToDate(value));
  };

  const onChangeEndDateValue = (value: DateValue) => {
    setDateValue(v => ({ ...v, end: value }));
    setEndDate(valueToDate(value));
  };

  const tableContent = useMemo(() => {
    const start = (page - 1) * +rowsPerPage;
    const end = start + +rowsPerPage;

    const filteredData = transactions.data
      ?.filter(transaction => {
        const accountMatch =
          Array.from(accountValue).toString() === 'all' || new Set(Array.from(accountValue)).has(transaction.accountId);

        return accountMatch;
      })
      .filter(transaction => {
        const categoryMatch =
          Array.from(categoryValue).toString() === 'all' ||
          (transaction.categoryId ? new Set(Array.from(categoryValue)).has(transaction.categoryId) : false);

        return categoryMatch;
      });

    const coercedTransactionData = filteredData?.map(transaction => ({
      ...transaction,
      accountName: transaction.account.accountName,
      categoryName: transaction.category?.categoryName,
      amountValue: transaction.amount,
      dateValue: transaction.date,
    }));

    const dataToUse = coercedTransactionData || [];

    setPages(Math.ceil(dataToUse.length / +rowsPerPage));
    setTransactionListLength(dataToUse.length);

    return dataToUse
      .sort((a, b) => {
        const first = a[sortDescriptor.column as keyof typeof a];
        const second = b[sortDescriptor.column as keyof typeof b];
        const cmp = (first ?? 0) < (second ?? 0) ? -1 : (first ?? 0) > (second ?? 0) ? 1 : 0;

        return sortDescriptor.direction === 'descending' ? -cmp : cmp;
      })
      .slice(start, end)
      .map(transaction => ({
        ...transaction,
        rawTransaction: transaction,
        date: <p className="text-xs lg:text-sm font-semibold">{format(new Date(transaction.date), 'dd MMM, yyyy')}</p>,
        notesValue: transaction.notes,
        amount: (
          <div className="flex gap-1 items-center">
            <div className={transaction.amount < 0 ? 'text-red-500' : ''}>
              {currencyMap.get(transaction.account.currency)?.sign}
            </div>
            <div className={cn('font-semibold', transaction.amount < 0 ? 'text-red-500' : '')}>
              {numberWithSpaces(transaction.account.hideDecimal ? Math.round(transaction.amount) : transaction.amount)}
            </div>
          </div>
        ),
        notes: (
          <div className="text-xs lg:text-sm text-gray-500 italic truncate text-ellipsis md:max-w-[70px] lg:max-w-[160px] xl:max-w-[250px]">
            <Tooltip showArrow={true} content={<div className="px-4 py-2">{transaction.notes}</div>}>
              <span>{transaction.notes}</span>
            </Tooltip>
          </div>
        ),
        categoryName: (
          <div className="flex justify-center">
            {transaction.categoryName ? (
              <p className="py-0.5 px-3 border-2 bg-orange-50 border-orange-100 rounded-full truncate md:text-clip text-ellipsis max-w-[160px] md:max-w-fit text-orange-500">
                {transaction.categoryName}
              </p>
            ) : (
              <p className="flex gap-1 text-red-500">
                <TriangleAlert size={18} /> <span>Uncategorized</span>
              </p>
            )}
          </div>
        ),
        accountName: (
          <div className="flex justify-center">
            <AccountName
              color={transaction.account.color}
              accountName={transaction.account.accountName}
              isDefault={transaction.account.isDefault}
            />
          </div>
        ),
        actions: (
          <div className="flex justify-center gap-2 lg:gap-3">
            <Button isIconOnly size="sm" variant="light">
              <EyeIcon
                className="cursor-pointer text-green-500"
                onClick={() => {
                  setTransaction(transaction);
                  onOpenView();
                }}
              />
            </Button>
            <Button isIconOnly size="sm" variant="light">
              <Pencil
                className="cursor-pointer text-orange-300"
                onClick={() =>
                  updateClick({
                    id: transaction.id,
                    amount: transaction.amountValue,
                    accountId: transaction.accountId,
                    categoryId: transaction.categoryId,
                    date: transaction.dateValue,
                    notes: transaction.notes,
                  })
                }
              />
            </Button>
            <Button isIconOnly size="sm" variant="light" disabled={deleteTransaction.isPending}>
              {deleteTransaction.isPending && transaction.id === deleteTransaction.variables ? (
                <Loader2 className="text-slate-400 animate-spin" size={24} />
              ) : (
                <Trash2 className="cursor-pointer text-red-500" onClick={() => handleClick(transaction.id)} />
              )}
            </Button>
          </div>
        ),
      }));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page, transactions.data, rowsPerPage, sortDescriptor, accountValue, categoryValue, deleteTransaction.isPending]);

  const TopContent = () => (
    <>
      <div className="h-full flex gap-4 flex-col items-end lg:flex-row lg:items-center sm:justify-between mb-4 lg:mb-0">
        <div className="flex flex-col lg:flex-row gap-4 items-center w-full lg:w-auto">
          <div className="w-full flex flex-col">
            <div className="flex flex-col sm:flex-row gap-2 sm:items-center w-full lg:w-auto">
              {isUserSettingsLoading ? (
                <>
                  <Skeleton className="w-[160px] h-14 rounded-lg bg-slate-100" />
                  <Skeleton className="w-[160px] h-14 rounded-lg bg-slate-100" />
                </>
              ) : (
                <>
                  <DatePicker
                    label="Date from"
                    granularity="day"
                    value={dateValue.start}
                    onChange={onChangeStartDateValue}
                    className="w-full lg:w-[160px]"
                    isDisabled={transactions.isLoading}
                  />
                  <DatePicker
                    label="Date to"
                    granularity="day"
                    value={dateValue.end}
                    onChange={onChangeEndDateValue}
                    className="w-full lg:w-[160px]"
                    isDisabled={transactions.isLoading}
                  />
                </>
              )}
            </div>
            <p className="lg:hidden text-xs italic text-gray-400 mt-1 ml-1">
              {isToday(valueToDate(dateValue.end))
                ? `last ${periodInDays + 1} days selected`
                : `${periodInDays + 1} days selected`}
            </p>
          </div>
          <div className="flex flex-col sm:flex-row gap-2 items-center w-full lg:w-auto">
            {categories.data && categories.data.length > 0 && (
              <Select
                items={[{ id: 'all', categoryName: 'All categories' }, ...categories.data]}
                label="Select category"
                isLoading={categories.isLoading}
                isDisabled={categories.isLoading}
                selectedKeys={categoryValue}
                onSelectionChange={setCategoryValue}
                className="w-full lg:w-[160px]"
              >
                {category => <SelectItem key={category.id}>{category.categoryName}</SelectItem>}
              </Select>
            )}
            {accounts.data && accounts.data.length > 0 && (
              <Select
                items={[{ id: 'all', accountName: 'All accounts' }, ...accounts.data]}
                label="Select account"
                isLoading={accounts.isLoading}
                isDisabled={accounts.isLoading}
                selectedKeys={accountValue}
                onSelectionChange={setAccountValue}
                className="w-full lg:w-[160px]"
              >
                {account => <SelectItem key={account.id}>{account.accountName}</SelectItem>}
              </Select>
            )}
          </div>
        </div>
        {isUserSettingsLoading ? (
          <Skeleton className="w-[180px] h-14 rounded-lg bg-slate-100" />
        ) : (
          <Select
            label="Select rows per page"
            className="w-[180px]"
            selectedKeys={[rowsPerPage]}
            onChange={onRowsPerPageChange}
          >
            {rowsPerPageArray.map(row => (
              <SelectItem key={row.key}>{row.label}</SelectItem>
            ))}
          </Select>
        )}
      </div>
      <p className="hidden lg:block text-xs italic text-gray-400 mb-3 ml-1 mt-1">
        {!isUserSettingsLoading
          ? isToday(valueToDate(dateValue.end))
            ? `last ${periodInDays + 1} days selected`
            : `${periodInDays + 1} days selected`
          : ''}
      </p>
    </>
  );

  const BottomContent = () => (
    <div className={cn('w-full justify-center', pages > 1 ? 'flex' : 'hidden')}>
      <Pagination
        isCompact
        showControls
        showShadow
        color="secondary"
        page={page}
        total={pages}
        onChange={page => setPage(page)}
      />
    </div>
  );

  return (
    <>
      {/* Desktop content */}
      <Table
        aria-label="Transaction table"
        topContent={<TopContent />}
        topContentPlacement="outside"
        bottomContent={<BottomContent />}
        selectionMode="multiple"
        selectedKeys={selectedKeys}
        onSelectionChange={onSelectedKeys}
        sortDescriptor={sortDescriptor}
        onSortChange={descriptor => setSortDescriptor(descriptor as SortDescriptor)}
        classNames={{ wrapper: pages > 1 ? 'min-h-[370px]' : '' }}
        className="hidden md:block"
      >
        <TableHeader columns={columns}>
          {column => (
            <TableColumn
              key={column.key}
              align={column.key === 'date' || column.key === 'amount' || column.key === 'notes' ? 'start' : 'center'}
              allowsSorting={column.sortable}
            >
              {column.label}
            </TableColumn>
          )}
        </TableHeader>
        <TableBody
          items={tableContent || []}
          emptyContent={'No transactions to display.'}
          isLoading={transactions.isLoading}
          loadingContent={<Spinner label="Loading..." />}
        >
          {item => (
            <TableRow key={item.id}>{columnKey => <TableCell>{getKeyValue(item, columnKey)}</TableCell>}</TableRow>
          )}
        </TableBody>
      </Table>

      {/* Mobile content */}
      {transactions.isLoading ? (
        <div className="flex justify-center bg-white shadow-md rounded-lg p-4 mb-4">
          <Spinner label="Loading..." />
        </div>
      ) : (
        <div className="md:hidden">
          <TopContent />
          {tableContent?.length > 0 ? (
            tableContent?.map(transaction => (
              <div key={transaction.id} className="bg-white shadow-md rounded-lg p-4 mb-4">
                <div className="text-sm text-gray-500 mb-4">{transaction.date}</div>
                <div className="flex justify-between items-center">
                  <div className="text-lg font-semibold">{transaction.amount}</div>
                  <div className="flex gap-3">
                    <EyeIcon
                      className="cursor-pointer text-green-500"
                      onClick={() => {
                        setTransaction(transaction.rawTransaction);
                        onOpenView();
                      }}
                    />
                    <Pencil
                      size={24}
                      className="cursor-pointer text-orange-300"
                      onClick={() =>
                        updateClick({
                          id: transaction.id,
                          amount: transaction.amountValue,
                          accountId: transaction.accountId,
                          categoryId: transaction.categoryId,
                          date: transaction.dateValue,
                          notes: transaction.notesValue,
                        })
                      }
                    />
                    <Trash2
                      size={24}
                      className={cn(
                        'cursor-pointer text-red-500',
                        deleteTransaction.isPending && transaction.id === deleteTransaction.variables
                          ? 'opacity-50'
                          : ''
                      )}
                      onClick={() => handleClick(transaction.id)}
                    />
                  </div>
                </div>
                <div className="flex gap-2 flex-wrap justify-between items-center mt-3">
                  <div className="text-sm text-gray-500">{transaction.categoryName}</div>
                  <div className="text-sm text-gray-500">{transaction.accountName}</div>
                </div>
                <div className="text-xs text-gray-500 italic mt-2">{transaction.notes}</div>
              </div>
            ))
          ) : (
            <div className="sm:hidden bg-white shadow-md rounded-lg p-4 mb-4">
              <p className="text-center">No categories to display.</p>
            </div>
          )}
          <div className="sm:hidden mt-6">
            <BottomContent />
          </div>
        </div>
      )}

      {/* Modals */}
      <TransactionModal isOpen={isOpenUpdate} onOpenChange={onOpenChangeUpdate} transaction={updateTransaction} />
      <ViewModal isOpen={isOpenView} onOpenChange={onOpenChangeView} transaction={transaction} />
      <ConfirmModal />
    </>
  );
};
