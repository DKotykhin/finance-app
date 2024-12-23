'use client';

import React, { useState, useMemo, useCallback, useEffect } from 'react';

import type { Selection } from '@nextui-org/react';
import {
  Button,
  Input,
  Pagination,
  Select,
  SelectItem,
  Spinner,
  Table,
  TableHeader,
  TableColumn,
  TableBody,
  TableRow,
  TableCell,
  getKeyValue,
  useDisclosure,
} from '@nextui-org/react';
import { EyeOff, Loader2, Pencil, SearchIcon, Trash2 } from 'lucide-react';
import { format } from 'date-fns';

import type { UserSettings } from '@prisma/client';
import { SortOrder } from '@prisma/client';

import type { ExtendedAccount } from '@/actions';
import type { AccountFormTypes } from '@/validation';
import { cn, currencyMap, numberWithSpaces, rowsPerPageArray } from '@/utils';
import { useFetchAccount, useConfirm } from '@/hooks';
import { useAccountsStore } from '@/store';

import { columns } from './const';
import { AccountModal } from './AccountModal';
import { AccountName } from './AccountName';

interface AccountListProps {
  accountData?: ExtendedAccount[];
  isAccountLoading: boolean;
  userSettingsData?: UserSettings | null;
  isUserSettingsLoading: boolean;
  selectedKeysFn: (keys: any) => void;
  accountListLengthFn: (length: number) => void;
}

interface SortDescriptor {
  column: (typeof columns)[number]['key'];
  direction: SortOrder;
}

export interface AccountUpdate extends AccountFormTypes {
  id: string;
}

export const AccountList: React.FC<AccountListProps> = ({
  accountData,
  isAccountLoading,
  userSettingsData,
  isUserSettingsLoading,
  selectedKeysFn,
  accountListLengthFn,
}) => {
  const [account, setAccount] = useState<AccountUpdate | null>(null);
  const [filterValue, setFilterValue] = useState('');
  const [selectedKeys, setSelectedKeys] = useState<Selection>(new Set());
  const [page, setPage] = useState(1);
  const [pages, setPages] = useState(1);
  const [accountListLength, setAccountListLength] = useState(0);

  const [sortDescriptor, setSortDescriptor] = useState<SortDescriptor>({
    column: userSettingsData?.accountSortField || 'createdAt',
    direction: userSettingsData?.accountSortOrder || SortOrder.descending,
  });

  const { isOpen, onOpen, onOpenChange } = useDisclosure();
  
  const { rowsPerPage, setRowsPerPage } = useAccountsStore();
  const { deleteAccount } = useFetchAccount();

  useEffect(() => {
    if (!rowsPerPage) setRowsPerPage(userSettingsData?.accountRowsPerPage || '5');
  }, [rowsPerPage, setRowsPerPage, userSettingsData?.accountRowsPerPage]);

  useEffect(() => {
    accountListLengthFn(accountListLength);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [accountListLength]);

  const [ConfirmModal, confirm] = useConfirm({
    title: 'Delete Account',
    message:
      'Are you sure you want to delete this account? All transactions associated with this account will be deleted.',
  });

  const handleClick = async (id: string) => {
    const ok = await confirm();

    if (ok) {
      deleteAccount.mutateAsync(id);
    }
  };

  const updateClick = (account: AccountUpdate) => {
    setAccount(account);
    onOpen();
  };

  const onSearchChange = useCallback((value: string) => {
    if (value) {
      setFilterValue(value);
      setPage(1);
    } else {
      setFilterValue('');
    }
  }, []);

  const onClear = useCallback(() => {
    setFilterValue('');
    setPage(1);
  }, []);

  const onRowsPerPageChange = useCallback((e: { target: { value: string } }) => {
      setRowsPerPage(e.target.value);
      setPage(1);
    }, [setRowsPerPage]);

  const onSelectedKeys = (keys: Selection) => {
    setSelectedKeys(keys);
    selectedKeysFn(keys === 'all' ? tableContent?.map(account => account.id) : Array.from(keys));
  };

  const tableContent = useMemo(() => {
    const start = (page - 1) * +rowsPerPage;
    const end = start + +rowsPerPage;

    const filteredData =
      accountData?.filter(account => account.accountName.toLowerCase().includes(filterValue.toLowerCase())) || [];

    const dataToUse = filterValue ? filteredData : accountData || [];

    setPages(Math.ceil(dataToUse.length / +rowsPerPage));
    setAccountListLength(dataToUse.length);

    const dataToUseWithBallance = dataToUse.map(account => ({
      ...account,
      balance: account.transactions.reduce((acc, item) => item.amount + acc, 0),
    }));

    return dataToUseWithBallance
      .sort((a, b) => {
        const first = a[sortDescriptor.column as keyof typeof a];
        const second = b[sortDescriptor.column as keyof typeof b];
        const cmp = first < second ? -1 : first > second ? 1 : 0;

        return sortDescriptor.direction === 'descending' ? -cmp : cmp;
      })
      .slice(start, end)
      .map(account => ({
        ...account,
        accountNameValue: account.accountName,
        currencyValue: account.currency,
        hideDecimalValue: account.hideDecimal,
        accountName: (
          <AccountName color={account.color} isDefault={account.isDefault} accountName={account.accountName} />
        ),
        balance: (
          <div className="flex gap-1 items-center">
            <div>{currencyMap.get(account.currency)?.sign}</div>
            <div className={cn('font-semibold shrink-0', account.balance < 0 ? 'text-red-500' : '')}>
              {numberWithSpaces(
                account.hideDecimal ? Math.round(account.balance) : Math.round(account.balance * 100) / 100
              )}
            </div>
          </div>
        ),
        hideDecimal: <p className="flex justify-center">{account.hideDecimal ? <EyeOff size={20} /> : ''}</p>,
        createdAt: <p className="font-semibold">{format(new Date(account.createdAt), 'dd MMM, yyyy')}</p>,
        actions: (
          <div className="flex justify-center gap-4">
            <Button isIconOnly size="sm" variant="light">
              <Pencil className="cursor-pointer text-orange-300" onClick={() => updateClick(account)} />
            </Button>
            <Button isIconOnly size="sm" variant="light" disabled={deleteAccount.isPending}>
              {deleteAccount.isPending && account.id === deleteAccount.variables ? (
                <Loader2 className="text-slate-400 animate-spin" size={24} />
              ) : (
                <Trash2 className="cursor-pointer text-red-500" onClick={() => handleClick(account.id)} />
              )}
            </Button>
          </div>
        ),
      }));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page, accountData, filterValue, rowsPerPage, sortDescriptor, deleteAccount.isPending]);

  const TopContent = () => (
    <div className="flex gap-6 sm:items-center sm:justify-between mb-6 flex-col sm:flex-row">
      <Input
        isClearable
        autoFocus
        placeholder="Search account"
        className="w-full sm:max-w-[250px]"
        startContent={<SearchIcon />}
        value={filterValue}
        onClear={() => onClear()}
        onValueChange={onSearchChange}
      />
      <Select
        label="Select rows per page"
        labelPlacement="outside-left"
        className="max-w-[400px] sm:max-w-[200px] self-end"
        selectedKeys={[rowsPerPage]}
        onChange={onRowsPerPageChange}
        isLoading={isUserSettingsLoading}
      >
        {rowsPerPageArray.map(row => (
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
        onChange={page => setPage(page)}
      />
    </div>
  );

  return (
    <>
      {/* Desktop content */}
      <Table
        aria-label="Account table"
        topContent={<TopContent />}
        topContentPlacement="outside"
        bottomContent={<BottomContent />}
        selectionMode="multiple"
        selectedKeys={selectedKeys}
        onSelectionChange={onSelectedKeys}
        sortDescriptor={sortDescriptor}
        onSortChange={descriptor => setSortDescriptor(descriptor as SortDescriptor)}
        classNames={{ wrapper: pages > 1 ? 'min-h-[370px]' : '' }}
        className="hidden sm:block"
      >
        <TableHeader columns={columns}>
          {column => (
            <TableColumn
              key={column.key}
              align={column.key === 'accountName' || column.key === 'balance' ? 'start' : 'center'}
              allowsSorting={column.sortable}
            >
              {column.label}
            </TableColumn>
          )}
        </TableHeader>
        <TableBody
          items={tableContent || []}
          emptyContent={'No accounts to display.'}
          isLoading={isAccountLoading}
          loadingContent={<Spinner label="Loading..." />}
        >
          {item => (
            <TableRow key={item.id}>{columnKey => <TableCell>{getKeyValue(item, columnKey)}</TableCell>}</TableRow>
          )}
        </TableBody>
      </Table>

      {/* Mobile content */}
      {isAccountLoading ? (
        <div className="flex justify-center bg-white shadow-md rounded-lg p-4 mb-4">
          <Spinner label="Loading..." />
        </div>
      ) : (
        <div className="sm:hidden">
          <TopContent />
          {tableContent?.length > 0 ? (
            tableContent?.map(account => (
              <div key={account.id} className="bg-white shadow-md rounded-lg py-4 px-2 mb-4">
                <div className="flex gap-2 justify-between items-center">
                  <div>{account.accountName}</div>
                  <div className="flex gap-4">
                    <Pencil
                      size={24}
                      className="cursor-pointer text-orange-300"
                      onClick={() =>
                        updateClick({
                          accountName: account.accountNameValue,
                          id: account.id,
                          currency: account.currencyValue,
                          hideDecimal: account.hideDecimalValue,
                          isDefault: account.isDefault,
                        })
                      }
                    />
                    <Trash2
                      size={24}
                      className={cn(
                        'cursor-pointer text-red-500',
                        deleteAccount.isPending && account.id === deleteAccount.variables ? 'opacity-50' : ''
                      )}
                      onClick={() => handleClick(account.id)}
                    />
                  </div>
                </div>
                <div className="flex justify-between items-center mt-2">
                  <div className="text-sm text-gray-500">{account.balance}</div>
                  <div className="text-sm text-gray-500">{account.hideDecimal}</div>
                  <div className="text-sm text-gray-500">{account.createdAt}</div>
                </div>
              </div>
            ))
          ) : (
            <div className="sm:hidden bg-white shadow-md rounded-lg p-4 mb-4">
              <p className="text-center">No accounts to display.</p>
            </div>
          )}
          <div className="sm:hidden mt-6">
            <BottomContent />
          </div>
        </div>
      )}

      {/* Modals */}
      <AccountModal isOpen={isOpen} onOpenChange={onOpenChange} account={account} />
      <ConfirmModal />
    </>
  );
};
