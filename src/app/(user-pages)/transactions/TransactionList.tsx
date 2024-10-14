'use client';

import React, { useState, useMemo, useCallback, useEffect } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  Badge,
  Button,
  Chip,
  DatePicker,
  Pagination,
  Select,
  SelectItem,
  Skeleton,
  Spinner,
  Tooltip,
  useDisclosure,
} from '@nextui-org/react';
import { EyeIcon, Loader2, Pencil, Trash2, TriangleAlert } from 'lucide-react';
import { toast } from 'react-toastify';
import { differenceInDays, format, subDays, isToday } from 'date-fns';
import { useUser } from '@clerk/nextjs';
import {
  Selection,
  Table,
  TableHeader,
  TableColumn,
  TableBody,
  TableRow,
  TableCell,
  getKeyValue,
} from '@nextui-org/react';
import { DateValue, parseAbsoluteToLocal } from '@internationalized/date';
import { SortOrder, UserSettings } from '@prisma/client';

import {
  deleteTransaction,
  ExtendedTransaction,
  getTransactions,
  TransactionCreate,
} from '@/actions/Transaction/_index';
import { getAccounts } from '@/actions/Account/_index';
import { getCategories } from '@/actions/Category/_index';
import { useConfirm } from '@/hooks/use-confirm';
import { cn, currencyMap, dateToValue, numberWithSpaces, rowsPerPageArray, valueToDate } from '@/utils/_index';
import { useTransactionsStore } from '@/store/transactionsSlice';

import { TransactionModal } from './TransactionModal';
import { columns } from './const';
import { ViewModal } from './ViewModal';

interface TransactionListProps {
  userSettingsData?: UserSettings | null;
  isUserSettingsLoading: boolean;
  // eslint-disable-next-line no-unused-vars
  selectedKeysFn: (keys: any) => void;
  // eslint-disable-next-line no-unused-vars
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
  const { accountValue, categoryValue, startDate, endDate, setAccountValue, setCategoryValue, setStartDate, setEndDate } =
    useTransactionsStore();

  const [updateTransaction, setUpdateTransaction] = useState<TransactionUpdate | null>(null);
  const [transaction, setTransaction] = useState<ExtendedTransaction | null>(null);
  const [selectedKeys, setSelectedKeys] = useState<Selection>(new Set());
  const [sortDescriptor, setSortDescriptor] = useState<SortDescriptor>({
    column: userSettingsData?.transactionSortField || 'date',
    direction: userSettingsData?.transactionSortOrder || SortOrder.descending,
  });
  const [page, setPage] = useState(1);
  const [pages, setPages] = useState(1);
  const [transactionListLength, setTransactionListLength] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(userSettingsData?.transactionRowsPerPage || '5');
  // to do: move to store
  const [dateValue, setDateValue] = useState<{ start: DateValue; end: DateValue }>({
    start: parseAbsoluteToLocal(subDays(new Date(), 30).toISOString()),
    end: parseAbsoluteToLocal(new Date().toISOString()),
  });

  const { user } = useUser();
  const { isOpen: isOpenView, onOpen: onOpenView, onOpenChange: onOpenChangeView } = useDisclosure();
  const { isOpen: isOpenUpdate, onOpen: onOpenUpdate, onOpenChange: onOpenChangeUpdate } = useDisclosure();

  const periodInDays = useMemo(() => {
    return differenceInDays(valueToDate(dateValue.end), valueToDate(dateValue.start));
  }, [dateValue]);

  useEffect(() => {
    if (startDate) {
      setDateValue((v) => ({ ...v, start: dateToValue(startDate) }));
    } else {
      setDateValue((v) => ({
        ...v,
        start: parseAbsoluteToLocal(subDays(new Date(), (userSettingsData?.transactionPeriod ?? 30) - 1).toISOString()),
      }));
    }
    if (endDate) {
      setDateValue((v) => ({ ...v, end: dateToValue(endDate) }));
    } else {
      setDateValue((v) => ({ ...v, end: parseAbsoluteToLocal(new Date().toISOString()) }));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userSettingsData?.transactionPeriod]);

  useEffect(() => {
    if (userSettingsData?.transactionRowsPerPage) {
      setRowsPerPage(userSettingsData.transactionRowsPerPage);
    }
  }, [userSettingsData?.transactionRowsPerPage]);

  useEffect(() => {
    transactionListLengthFn(transactionListLength);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [transactionListLength]);

  const [ConfirmModal, confirm] = useConfirm({
    title: 'Delete Transaction',
    message: 'Are you sure you want to delete this transaction?',
  });

  const queryClient = useQueryClient();

  const { data: accountData, isLoading: isAccountLoading } = useQuery({
    enabled: !!user?.id,
    queryKey: ['accounts'],
    queryFn: () => getAccounts(user?.id as string),
  });

  const { data: categoryData, isLoading: isCategoryLoading } = useQuery({
    enabled: !!user?.id,
    queryKey: ['categories'],
    queryFn: () => getCategories({ userId: user?.id as string }),
  });

  const { data: transactionData, isLoading: isTransactionLoading } = useQuery({
    enabled: !!accountData,
    queryKey: ['transactions', dateValue],
    queryFn: () =>
      getTransactions({
        accountIds: accountData?.map((account) => account.id) ?? [],
        from: valueToDate(dateValue.start),
        to: valueToDate(dateValue.end),
      }),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => deleteTransaction(id),
    onSuccess: () => {
      toast.success('Transaction deleted successfully');
      Promise.all([
        queryClient.invalidateQueries({
          queryKey: ['transactions'],
        }),
        queryClient.invalidateQueries({
          queryKey: ['transactionsWithStat'],
        }),
        queryClient.invalidateQueries({
          queryKey: ['previousTransactionsWithStat'],
        }),
        queryClient.invalidateQueries({
          queryKey: ['transactionsByCategory'],
        }),
        queryClient.invalidateQueries({
          queryKey: ['previousTransactionsByCategory'],
        }),
        queryClient.invalidateQueries({
          queryKey: ['todaysTransactionsData'],
        }),
      ]);
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });

  const handleClick = async (id: string) => {
    const ok = await confirm();
    if (ok) {
      deleteMutation.mutateAsync(id);
    }
  };

  const updateClick = (transaction: TransactionUpdate) => {
    setUpdateTransaction(transaction);
    onOpenUpdate();
  };

  const onRowsPerPageChange = useCallback((e: { target: { value: React.SetStateAction<string> } }) => {
    setRowsPerPage(e.target.value);
    setPage(1);
  }, []);

  const onSelectedKeys = (keys: Selection) => {
    setSelectedKeys(keys);
    selectedKeysFn(keys === 'all' ? tableContent?.map((transaction) => transaction.id) : Array.from(keys));
  };

  const onChangeStartDateValue = (value: DateValue) => {
    setDateValue((v) => ({ ...v, start: value }));
    setStartDate(valueToDate(value));
  };
  const onChangeEndDateValue = (value: DateValue) => {
    setDateValue((v) => ({ ...v, end: value }));
    setEndDate(valueToDate(value));
  };

  const tableContent = useMemo(() => {
    const start = (page - 1) * +rowsPerPage;
    const end = start + +rowsPerPage;

    const filteredData = transactionData
      ?.filter((transaction) => {
        const accountMatch =
          Array.from(accountValue).toString() === 'all' || new Set(Array.from(accountValue)).has(transaction.accountId);
        return accountMatch;
      })
      .filter((transaction) => {
        const categoryMatch =
          Array.from(categoryValue).toString() === 'all' ||
          (transaction.categoryId ? new Set(Array.from(categoryValue)).has(transaction.categoryId) : false);
        return categoryMatch;
      });

    const coercedTransactionData = filteredData?.map((transaction) => ({
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
      .map((transaction) => ({
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
          <Chip
            color={transaction.categoryName ? 'secondary' : 'danger'}
            variant={transaction.categoryName ? 'faded' : 'light'}
          >
            {transaction.categoryName ?? (
              <p className="flex gap-1">
                <TriangleAlert size={18} /> <span>Uncategorized</span>
              </p>
            )}
          </Chip>
        ),
        accountName: (
          <Badge content="" isInvisible={!transaction.account.isDefault} color="primary">
            <p className="py-0.5 px-3 border-2 bg-slate-100 border-slate-300 rounded-full truncate md:text-clip text-ellipsis max-w-[160px] md:max-w-fit text-blue-700">
              {transaction.accountName}
            </p>
          </Badge>
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
            <Button isIconOnly size="sm" variant="light" disabled={deleteMutation.isPending}>
              {deleteMutation.isPending && transaction.id === deleteMutation.variables ? (
                <Loader2 className="text-slate-400 animate-spin" size={24} />
              ) : (
                <Trash2 className="cursor-pointer text-red-500" onClick={() => handleClick(transaction.id)} />
              )}
            </Button>
          </div>
        ),
      }));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page, transactionData, rowsPerPage, sortDescriptor, accountValue, categoryValue]);

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
                    isDisabled={isTransactionLoading}
                  />
                  <DatePicker
                    label="Date to"
                    granularity="day"
                    value={dateValue.end}
                    onChange={onChangeEndDateValue}
                    className="w-full lg:w-[160px]"
                    isDisabled={isTransactionLoading}
                  />
                </>
              )}
            </div>
            <p className="lg:hidden text-xs italic text-gray-400 mt-1 ml-1">
              {isToday(valueToDate(dateValue.end)) ? `last ${periodInDays + 1} days selected` : `${periodInDays + 1} days selected`}
            </p>
          </div>
          <div className="flex flex-col sm:flex-row gap-2 items-center w-full lg:w-auto">
            {categoryData && categoryData.length > 0 && (
              <Select
                items={[{ id: 'all', categoryName: 'All categories' }, ...categoryData]}
                label="Select category"
                isLoading={isCategoryLoading}
                isDisabled={isCategoryLoading}
                selectedKeys={categoryValue}
                onSelectionChange={setCategoryValue}
                className="w-full lg:w-[160px]"
              >
                {(category) => <SelectItem key={category.id}>{category.categoryName}</SelectItem>}
              </Select>
            )}
            {accountData && accountData.length > 0 && (
              <Select
                items={[{ id: 'all', accountName: 'All accounts' }, ...accountData]}
                label="Select account"
                isLoading={isAccountLoading}
                isDisabled={isAccountLoading}
                selectedKeys={accountValue}
                onSelectionChange={setAccountValue}
                className="w-full lg:w-[160px]"
              >
                {(account) => <SelectItem key={account.id}>{account.accountName}</SelectItem>}
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
            {rowsPerPageArray.map((row) => (
              <SelectItem key={row.key}>{row.label}</SelectItem>
            ))}
          </Select>
        )}
      </div>
      {!isUserSettingsLoading && (
        <p className="hidden lg:block text-xs italic text-gray-400 mb-3 ml-1 mt-1">
          {isToday(valueToDate(dateValue.end)) ? `last ${periodInDays + 1} days selected` : `${periodInDays + 1} days selected`}
        </p>
      )}
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
        onChange={(page) => setPage(page)}
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
        onSortChange={(descriptor) => setSortDescriptor(descriptor as SortDescriptor)}
        classNames={{ wrapper: pages > 1 ? 'min-h-[370px]' : '' }}
        className="hidden md:block"
      >
        <TableHeader columns={columns}>
          {(column) => (
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
          isLoading={isTransactionLoading}
          loadingContent={<Spinner label="Loading..." />}
        >
          {(item) => (
            <TableRow key={item.id}>{(columnKey) => <TableCell>{getKeyValue(item, columnKey)}</TableCell>}</TableRow>
          )}
        </TableBody>
      </Table>

      {/* Mobile content */}
      {isTransactionLoading ? (
        <div className="flex justify-center bg-white shadow-md rounded-lg p-4 mb-4">
          <Spinner label="Loading..." />
        </div>
      ) : (
        <div className="md:hidden">
          <TopContent />
          {tableContent?.length > 0 ? (
            tableContent?.map((transaction) => (
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
                        deleteMutation.isPending && transaction.id === deleteMutation.variables ? 'opacity-50' : ''
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
