'use client';

import React, { useState } from 'react';
import { Button, Card, CardBody, CardHeader, Skeleton, useDisclosure } from '@nextui-org/react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Plus, Trash2 } from 'lucide-react';
import { toast } from 'react-toastify';
import dynamic from 'next/dynamic';

import { bulkDeleteAccounts, getUserAccounts } from '@/actions/Account/_index';
import { useConfirm } from '@/hooks/use-confirm';

import { AccountModal } from './AccountModal';
const AccountTable = dynamic(async () => (await import('./AccountTable')).AccountTable, { ssr: false });

export const AccountCard: React.FC<{ userId: string | null }> = ({ userId }) => {
  const [idList, setIdList] = useState<string[]>([]);
  const { isOpen, onOpen, onOpenChange } = useDisclosure();

  const queryClient = useQueryClient();

  const [ConfirmModal, confirm] = useConfirm({
    title: 'Delete Account',
    message:
      idList.length === 1
        ? 'Are you sure you want to delete this account?'
        : 'Are you sure you want to delete all these accounts?',
  });

  const { data: accountData, isLoading } = useQuery({
    enabled: !!userId,
    queryKey: ['accounts'],
    queryFn: () => getUserAccounts(userId as string),
  });

  const bulkDeleteMutation = useMutation({
    mutationFn: (idList: string[]) => bulkDeleteAccounts(idList),
    onSuccess: () => {
      toast.success('Accounts deleted successfully');
      queryClient.invalidateQueries({ queryKey: ['accounts'] });
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });

  const selectedKeysFn = (keys: string[]) => {
    setIdList(keys);
  };

  const onDelete = async () => {
    const ok = await confirm();
    if (ok) {
      bulkDeleteMutation.mutateAsync(idList);
    }
  };

  return (
    <>
      <Card className="-mt-24 mb-12 p-1 sm:p-4">
        <CardHeader className="flex flex-col sm:flex-row gap-4 justify-between items-start sm:items-center">
          {isLoading ? (
            <>
              <Skeleton className="w-[200px] h-10 rounded-lg bg-slate-100"></Skeleton>
              <Skeleton className="w-[200px] h-10 rounded-lg bg-slate-100"></Skeleton>
            </>
          ) : (
            <>
              <p className="font-bold text-xl">Account page</p>
              <div className="flex gap-4 w-full sm:w-auto">
                {idList.length > 0 && (
                  <Button
                    color="warning"
                    variant="bordered"
                    onPress={onDelete}
                    isDisabled={bulkDeleteMutation.isPending}
                    className="w-full sm:w-auto"
                  >
                    <Trash2 size={16} />
                    Delete ({idList.length})
                  </Button>
                )}
                <Button color="secondary" onPress={onOpen} className="w-full sm:w-auto">
                  <Plus size={16} />
                  Add New
                </Button>
              </div>
            </>
          )}
        </CardHeader>
        <CardBody>
          <AccountTable accountData={accountData} isLoading={isLoading} selectedKeysFn={selectedKeysFn} />
        </CardBody>
      </Card>
      <AccountModal isOpen={isOpen} onOpenChange={onOpenChange} />
      <ConfirmModal />
    </>
  );
};
