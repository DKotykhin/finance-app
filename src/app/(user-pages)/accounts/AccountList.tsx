'use client';

import React, { useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { CircularProgress, useDisclosure } from '@nextui-org/react';
import { Pencil, Trash2 } from 'lucide-react';
import { toast } from 'react-toastify';

import { deleteAccount, getAccount } from '@/actions/Account/_index';
import { cn } from '@/utils/cn';
import { Account } from '@prisma/client';
import { AccountModal } from './AccountModal';

export const AccountList: React.FC<{ userId: string | null }> = ({ userId }) => {
  const [account, setAccount] = useState<Account | null>(null);
  const { isOpen, onOpen, onOpenChange } = useDisclosure();

  const queryClient = useQueryClient();

  const { data: accountData, isLoading } = useQuery({
    queryKey: ['accounts'],
    queryFn: () => getAccount(userId as string),
  });

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
    await deleteMutation.mutateAsync(id);
  };

  const updateClick = (account: Account) => {
    setAccount(account);
    onOpen();
  };

  return isLoading ? (
    <div className="flex justify-center mt-12">
      <CircularProgress aria-label="Loading..." />
    </div>
  ) : (
    <>
      <div className="mt-12">
        {accountData?.map((account) => (
          <div key={account.id} className="mx-2 md:mx-10 p-1">
            <div className="flex flex-col sm:flex-row gap-4 justify-between items-start sm:items-center">
              <p className="font-bold text-lg">{account.accountName}</p>
              <div className="flex gap-2">
                <Pencil size={24} className="cursor-pointer" onClick={() => updateClick(account)} />
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
          </div>
        ))}
      </div>
      <AccountModal isOpen={isOpen} onOpenChange={onOpenChange} account={account} />
    </>
  );
};
