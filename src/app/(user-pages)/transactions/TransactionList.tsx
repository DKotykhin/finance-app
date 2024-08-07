'use client';

import React, { useState, useMemo, useCallback, useEffect } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Button, Chip, DatePicker, Pagination, Select, SelectItem, Spinner, useDisclosure } from '@nextui-org/react';
import { Loader2, Pencil, Trash2, TriangleAlert } from 'lucide-react';
import { toast } from 'react-toastify';
import { format, subDays } from 'date-fns';
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

import { deleteTransaction, getTransactions, TransactionCreate } from '@/actions/Transaction/_index';
import { getAccounts } from '@/actions/Account/_index';
import { getCategories } from '@/actions/Category/_index';
import { useConfirm } from '@/hooks/use-confirm';
import { cn, currencyMap, numberWithSpaces, valueToDate } from '@/utils/_index';

import { TransactionModal } from './TransactionModal';
import { columns, rowsPerPageArray } from './const';

interface TransactionListProps {
  // eslint-disable-next-line no-unused-vars
  selectedKeysFn: (keys: any) => void;
  // eslint-disable-next-line no-unused-vars
  transactionListLengthFn: (length: number) => void;
}

interface SortDescriptor {
  column: (typeof columns)[number]['key'];
  direction: 'ascending' | 'descending';
}

export interface TransactionUpdate extends TransactionCreate {
  id: string;
}

export const TransactionList: React.FC<TransactionListProps> = ({ selectedKeysFn, transactionListLengthFn }) => {
  const [transaction, setTransaction] = useState<TransactionUpdate | null>(null);
  const [selectedKeys, setSelectedKeys] = useState<Selection>(new Set());
  const [sortDescriptor, setSortDescriptor] = useState<SortDescriptor>({
    column: 'date',
    direction: 'descending',
  });
  const [page, setPage] = useState(1);
  const [pages, setPages] = useState(1);
  const [transactionListLength, setTransactionListLength] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState('5');
  const [dateValue, setDateValue] = useState<{ start: DateValue; end: DateValue }>({
    start: parseAbsoluteToLocal(subDays(new Date(), 30).toISOString()),
    end: parseAbsoluteToLocal(new Date().toISOString()),
  });
  const [accountValue, setAccountValue] = useState<Selection>(new Set(['all']));
  const [categoryValue, setCategoryValue] = useState<Selection>(new Set(['all']));

  const { user } = useUser();
  const { isOpen, onOpen, onOpenChange } = useDisclosure();

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
    setTransaction(transaction);
    onOpen();
  };

  const onRowsPerPageChange = useCallback((e: { target: { value: React.SetStateAction<string> } }) => {
    setRowsPerPage(e.target.value);
    setPage(1);
  }, []);

  const onSelectedKeys = (keys: Selection) => {
    setSelectedKeys(keys);
    selectedKeysFn(keys === 'all' ? tableContent?.map((transaction) => transaction.id) : Array.from(keys));
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
      categoryName: transaction.category?.name,
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
        date: <p className="font-semibold">{format(new Date(transaction.date), 'dd MMM, yyyy')}</p>,
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
        amount: (
          <div className="flex gap-2 items-center">
            <div className={transaction.amount < 0 ? 'text-red-500' : ''}>
              {currencyMap.get(transaction.account.currency)?.sign}
            </div>
            <div className={cn('font-semibold', transaction.amount < 0 ? 'text-red-500' : '')}>
              {numberWithSpaces(transaction.account.hideDecimal ? Math.round(transaction.amount) : transaction.amount)}
            </div>
          </div>
        ),
        accountName: (
          <Chip color="primary" variant={transaction.account.isDefault ? 'solid' : 'faded'}>
            {transaction.accountName}
          </Chip>
        ),
        actions: (
          <div className="flex justify-center gap-4">
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
    <div className="h-full flex gap-4 flex-col items-end sm:flex-row lg:items-center sm:justify-between mb-6">
      <div className="flex flex-col lg:flex-row gap-4 items-center w-full lg:w-auto">
        <div className="flex flex-col sm:flex-row gap-2 items-center w-full lg:w-auto">
          <DatePicker
            label="Date from"
            granularity="day"
            value={dateValue.start}
            onChange={(value) => setDateValue((v) => ({ ...v, start: value }))}
            className="w-full lg:w-[160px]"
          />
          <DatePicker
            label="Date to"
            granularity="day"
            value={dateValue.end}
            onChange={(value) => setDateValue((v) => ({ ...v, end: value }))}
            className="w-full lg:w-[160px]"
          />
        </div>
        <div className="flex flex-col sm:flex-row gap-2 items-center w-full lg:w-auto">
          {categoryData && categoryData.length > 0 && (
            <Select
              items={[{ id: 'all', name: 'All categories' }, ...categoryData]}
              label="Select category"
              isLoading={isCategoryLoading}
              isDisabled={isCategoryLoading}
              selectedKeys={categoryValue}
              onSelectionChange={setCategoryValue}
              className="w-full lg:w-[160px]"
            >
              {(category) => <SelectItem key={category.id}>{category.name}</SelectItem>}
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
      <div className="">
        <Select
          label="Select rows per page"
          // labelPlacement="outside-left"
          className="w-[180px]"
          selectedKeys={[rowsPerPage]}
          onChange={onRowsPerPageChange}
        >
          {rowsPerPageArray.map((row) => (
            <SelectItem key={row.key}>{row.label}</SelectItem>
          ))}
        </Select>
      </div>
    </div>
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
              align={column.key === 'date' || column.key === 'amount' ? 'start' : 'center'}
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
                  <div className="flex gap-4">
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
                          notes: transaction.notes,
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
      <TransactionModal isOpen={isOpen} onOpenChange={onOpenChange} transaction={transaction} />
      <ConfirmModal />
    </>
  );
};
