'use client';

import React, { useState, useMemo, useCallback } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Chip, Input, Pagination, Select, SelectItem, Spinner, useDisclosure } from '@nextui-org/react';
import { Pencil, SearchIcon, Trash2 } from 'lucide-react';
import { toast } from 'react-toastify';
import { format } from 'date-fns';
import { Table, TableHeader, TableColumn, TableBody, TableRow, TableCell, getKeyValue } from '@nextui-org/react';

import { deleteAccount } from '@/actions/Account/_index';
import { Account } from '@prisma/client';
import { useConfirm } from '@/hooks/use-confirm';
import { cn } from '@/utils/cn';

import { AccountModal } from './AccountModal';

const columns = [
  {
    key: 'accountName',
    label: 'Account Name',
  },
  {
    key: 'balance',
    label: 'Balance',
  },
  {
    key: 'createdAt',
    label: 'Created',
  },
  {
    key: 'actions',
    label: 'Actions',
  },
];

const rowsPerPageArray = [
  {
    key: '5',
    label: '5',
  },
  {
    key: '10',
    label: '10',
  },
  {
    key: '20',
    label: '20',
  },
];

interface AccountTableProps {
  accountData?: Account[];
  isLoading: boolean;
  // eslint-disable-next-line no-unused-vars
  selectedKeysFn: (keys: any) => void;
}

export interface AccountNameAndId {
  id: string;
  accountName: string;
}

export const AccountTable: React.FC<AccountTableProps> = ({ accountData, isLoading, selectedKeysFn }) => {
  const [account, setAccount] = useState<AccountNameAndId | null>(null);
  const [filterValue, setFilterValue] = useState('');
  const [selectedKeys, setSelectedKeys] = useState<any>([]);
  const { isOpen, onOpen, onOpenChange } = useDisclosure();

  const [page, setPage] = useState(1);
  const [pages, setPages] = useState(1);
  const [accountListLength, setAccountListLength] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState('5');

  const [ConfirmModal, confirm] = useConfirm({
    title: 'Delete Account',
    message: 'Are you sure you want to delete this account?',
  });

  const queryClient = useQueryClient();

  const deleteMutation = useMutation({
    mutationFn: (id: string) => deleteAccount(id),
    onSuccess: () => {
      toast.success('Account deleted successfully');
      queryClient.invalidateQueries({ queryKey: ['accounts'] });
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

  const updateClick = (account: AccountNameAndId) => {
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

  const onRowsPerPageChange = useCallback((e: { target: { value: React.SetStateAction<string> } }) => {
    setRowsPerPage(e.target.value);
    setPage(1);
  }, []);

  const onSelectedKeys = (keys: any) => {
    setSelectedKeys(keys);
    selectedKeysFn(keys === 'all' ? tableContent?.map((account) => account.id) : Array.from(keys));
  };

  const tableContent = useMemo(() => {
    const start = (page - 1) * +rowsPerPage;
    const end = start + +rowsPerPage;

    const filteredData =
      accountData?.filter((account) => account.accountName.toLowerCase().includes(filterValue)) || [];

    const dataToUse = filterValue ? filteredData : accountData || [];
    setPages(Math.ceil(dataToUse.length / +rowsPerPage));
    setAccountListLength(dataToUse.length);

    return dataToUse.slice(start, end).map((account) => ({
      id: account.id,
      accountName: account.accountName,
      balance: account.balance,
      createdAt: format(new Date(account.createdAt), 'dd MMM yyyy'),
      actions: (
        <div className="flex justify-center gap-4">
          <Pencil size={24} className="cursor-pointer text-orange-300" onClick={() => updateClick(account)} />
          <Trash2
            size={24}
            className={cn(
              'cursor-pointer text-red-500',
              deleteMutation.isPending && account.id === deleteMutation.variables ? 'opacity-50' : ''
            )}
            onClick={() => handleClick(account.id)}
          />
        </div>
      ),
    }));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page, accountData, filterValue, rowsPerPage]);

  const TopContent = () => (
    <div className="flex gap-6 sm:items-center sm:justify-between mb-6 flex-col sm:flex-row">
      <div className="flex gap-6 items-center">
        <Input
          isClearable
          autoFocus
          placeholder="Search"
          className="max-w-[250px]"
          startContent={<SearchIcon />}
          value={filterValue}
          onClear={() => onClear()}
          onValueChange={onSearchChange}
        />
        <Chip radius="md" color="secondary">
          {accountListLength}
        </Chip>
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
        aria-label="Account table"
        topContent={<TopContent />}
        topContentPlacement="outside"
        bottomContent={<BottomContent />}
        selectionMode="multiple"
        selectedKeys={selectedKeys}
        onSelectionChange={onSelectedKeys}
        classNames={{ wrapper: pages > 1 ? 'min-h-[330px]' : '' }}
        className="hidden sm:block"
      >
        <TableHeader columns={columns}>
          {(column) => (
            <TableColumn key={column.key} align={column.key === 'accountName' ? 'start' : 'center'}>
              {column.label}
            </TableColumn>
          )}
        </TableHeader>
        <TableBody
          items={tableContent || []}
          emptyContent={'No accounts to display.'}
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
            tableContent?.map((account) => (
              <div key={account.id} className="bg-white shadow-md rounded-lg p-4 mb-4">
                <div className="flex justify-between items-center">
                  <h3 className="text-lg font-semibold">{account.accountName}</h3>
                  <div className="flex gap-4">
                    <Pencil size={24} className="cursor-pointer text-orange-300" onClick={() => updateClick(account)} />
                    <Trash2
                      size={24}
                      className={cn(
                        'cursor-pointer text-red-500',
                        deleteMutation.isPending && account.id === deleteMutation.variables ? 'opacity-50' : ''
                      )}
                      onClick={() => handleClick(account.id)}
                    />
                  </div>
                </div>
                <div className="flex justify-between items-center mt-2">
                  <p className="text-sm text-gray-500">{account.balance}</p>
                  <p className="text-sm text-gray-500">{account.createdAt}</p>
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
