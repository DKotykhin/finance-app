'use client';

import React, { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useDisclosure } from '@nextui-org/react';
import { Pencil, Trash2 } from 'lucide-react';
import { toast } from 'react-toastify';

import { deleteAccount } from '@/actions/Account/_index';
import { Account } from '@prisma/client';
import { cn } from '@/utils/cn';
import { useConfirm } from '@/hooks/use-confirm';
import { AccountModal } from './AccountModal';

export const AccountList: React.FC<{ accountData?: Account[] }> = ({ accountData }) => {
  const [account, setAccount] = useState<Account | null>(null);
  const { isOpen, onOpen, onOpenChange } = useDisclosure();

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

  return (
    <>
      <div className="mt-8">
        {accountData?.length ? (
          accountData.map((account) => (
            <div key={account.id} className="mx-2 md:mx-10 p-1">
              <div className="flex flex-col sm:flex-row gap-4 justify-between items-start sm:items-center">
                <p className="font-bold text-lg">{account.accountName}</p>
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
            </div>
          ))
        ) : (
          <div className="mx-2 md:mx-10 p-1">
            <p className="text-center text-lg">No accounts found</p>
          </div>
        )}
      </div>
      <AccountModal isOpen={isOpen} onOpenChange={onOpenChange} account={account} />
      <ConfirmModal />
    </>
  );
};
