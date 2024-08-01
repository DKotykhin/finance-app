'use client';

import React, { useState, useMemo, useCallback } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Button, Chip, Pagination, Select, SelectItem, Spinner, useDisclosure } from '@nextui-org/react';
import { Pencil, Trash2 } from 'lucide-react';
import { toast } from 'react-toastify';
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

import { deleteTransaction, ExtendedTransaction } from '@/actions/Transaction/_index';
import { useConfirm } from '@/hooks/use-confirm';
import { TransactionFormTypes } from '@/validation/transactionValidation';
import { cn, currencyMap, numberWithSpaces } from '@/utils/_index';

import { TransactionModal } from './TransactionModal';
import { columns, rowsPerPageArray } from './const';
import { format } from 'date-fns';

interface TransactionListProps {
  transactionData?: ExtendedTransaction[];
  isLoading: boolean;
  // eslint-disable-next-line no-unused-vars
  selectedKeysFn: (keys: any) => void;
}

interface SortDescriptor {
  column: (typeof columns)[number]['key'];
  direction: 'ascending' | 'descending';
}

export interface TransactionUpdate extends TransactionFormTypes {
  id: string;
  date: Date;
}

export const TransactionList: React.FC<TransactionListProps> = ({ transactionData, isLoading, selectedKeysFn }) => {
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

  const { isOpen, onOpen, onOpenChange } = useDisclosure();

  const [ConfirmModal, confirm] = useConfirm({
    title: 'Delete Transaction',
    message: 'Are you sure you want to delete this transaction?',
  });

  const queryClient = useQueryClient();

  const deleteMutation = useMutation({
    mutationFn: (id: string) => deleteTransaction(id),
    onSuccess: () => {
      toast.success('Transaction deleted successfully');
      queryClient.invalidateQueries({ queryKey: ['transactions'] });
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
    const dataToUse = transactionData || [];

    setPages(Math.ceil(dataToUse.length / +rowsPerPage));
    setTransactionListLength(dataToUse.length);

    return dataToUse
      .sort((a, b) => {
        const first = a[sortDescriptor.column as keyof typeof a];
        const second = b[sortDescriptor.column as keyof typeof b];
        const cmp = first !== null && second !== null ? (first < second ? -1 : first > second ? 1 : 0) : 0;

        return sortDescriptor.direction === 'descending' ? -cmp : cmp;
      })
      .slice(start, end)
      .map((transaction) => ({
        ...transaction,
        amountValue: transaction.amount,
        dateValue: transaction.date,
        categoryName: transaction.category.name,
        accountName: transaction.account.accountName,
        date: <p className="font-semibold">{format(new Date(transaction.date), 'dd MMM, yyyy')}</p>,
        category: (
          <Chip color="secondary" variant="faded">
            {transaction.category.name}
          </Chip>
        ),
        amount: (
          <div className="flex gap-2 justify-center items-center">
            <div>{currencyMap.get(transaction.account.currency)?.sign}</div>
            <div className={cn('font-semibold', transaction.amount < 0 ? 'text-red-500' : '')}>
              {numberWithSpaces(
                transaction.account.hideDecimal
                  ? Math.round(transaction.amount)
                  : Math.round(transaction.amount * 100) / 100
              )}
            </div>
          </div>
        ),
        account: (
          <Chip color="primary" variant="faded">
            {transaction.account.accountName}
          </Chip>
        ),
        actions: (
          <div className="flex justify-center gap-4">
            <Button isIconOnly size="sm" variant="light">
              <Pencil
                className="cursor-pointer text-orange-300"
                onClick={() =>
                  updateClick({
                    ...transaction,
                    amount: transaction?.amount?.toString() || '',
                    notes: transaction?.notes || '',
                    date: transaction.date,
                  })
                }
              />
            </Button>
            <Button isIconOnly size="sm" variant="light">
              <Trash2
                className={cn(
                  'cursor-pointer text-red-500',
                  deleteMutation.isPending && transaction.id === deleteMutation.variables ? 'opacity-50' : ''
                )}
                onClick={() => handleClick(transaction.id)}
              />
            </Button>
          </div>
        ),
      }));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page, transactionData, rowsPerPage, sortDescriptor]);

  const TopContent = () => (
    <div
      className={cn(
        'gap-6 sm:items-center sm:justify-between mb-6 flex-col sm:flex-row',
        tableContent?.length > 0 ? 'flex' : 'hidden'
      )}
    >
      <div className="flex gap-6 items-center">
        {transactionListLength > 0 && (
          <Chip radius="md" color="secondary">
            {transactionListLength}
          </Chip>
        )}
      </div>
      <Select
        label="Select rows per page"
        labelPlacement="outside-left"
        className="w-full sm:max-w-[200px] self-end"
        selectedKeys={[rowsPerPage]}
        onChange={onRowsPerPageChange}
      >
        {rowsPerPageArray.map((row) => (
          <SelectItem key={row.key}>{row.label}</SelectItem>
        ))}
      </Select>
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
        className="hidden sm:block"
      >
        <TableHeader columns={columns}>
          {(column) => (
            <TableColumn
              key={column.key}
              align={column.key === 'date' ? 'start' : 'center'}
              allowsSorting={column.sortable}
            >
              {column.label}
            </TableColumn>
          )}
        </TableHeader>
        <TableBody
          items={tableContent || []}
          emptyContent={'No transactions to display.'}
          isLoading={isLoading}
          loadingContent={<Spinner label="Loading..." />}
        >
          {(item) => (
            <TableRow key={item.id}>{(columnKey) => <TableCell>{getKeyValue(item, columnKey)}</TableCell>}</TableRow>
          )}
        </TableBody>
      </Table>

      {/* Mobile content */}
      {isLoading ? (
        <div className="flex justify-center bg-white shadow-md rounded-lg p-4 mb-4">
          <Spinner label="Loading..." />
        </div>
      ) : (
        <div className="sm:hidden">
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
                          amount: transaction.amountValue.toString(),
                          accountId: transaction.accountId,
                          categoryId: transaction.categoryId,
                          date: transaction.dateValue,
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
                <div className="flex justify-between items-center mt-2">
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
