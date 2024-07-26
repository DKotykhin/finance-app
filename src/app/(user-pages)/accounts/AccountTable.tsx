'use client';

import React, { useState, useMemo } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Pagination, Spinner, useDisclosure } from '@nextui-org/react';
import { Pencil, Trash2 } from 'lucide-react';
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

interface AccountTableProps {
  accountData?: Account[];
  isLoading: boolean;
}

export const AccountTable: React.FC<AccountTableProps> = ({ accountData, isLoading }) => {
  const [account, setAccount] = useState<Account | null>(null);
  const { isOpen, onOpen, onOpenChange } = useDisclosure();

  const [page, setPage] = useState(1);
  const rowsPerPage = 4;

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

  const updateClick = (account: Account) => {
    setAccount(account);
    onOpen();
  };

  const pages = accountData?.length ? Math.ceil(accountData.length / rowsPerPage) : 1;

  const tableContent = useMemo(() => {
    const start = (page - 1) * rowsPerPage;
    const end = start + rowsPerPage;

    return accountData?.slice(start, end).map((account) => ({
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
  }, [page, accountData]);

  return (
    <>
      <Table
        aria-label="Account table"
        bottomContent={
          pages > 1 ? (
            <div className="flex w-full justify-center">
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
          ) : null
        }
        classNames={{
          wrapper: pages > 1 ? 'min-h-[300px]' : '',
        }}
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
      <AccountModal isOpen={isOpen} onOpenChange={onOpenChange} account={account} />
      <ConfirmModal />
    </>
  );
};
