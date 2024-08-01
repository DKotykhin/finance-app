'use client';

import React, { useState } from 'react';
import { Button, Card, CardBody, CardHeader, Skeleton, useDisclosure } from '@nextui-org/react';
import { Plus, Trash2 } from 'lucide-react';
import dynamic from 'next/dynamic';

import { useConfirm } from '@/hooks/use-confirm';
import { useQuery } from '@tanstack/react-query';
import { getTransactions } from '@/actions/Transaction/getTransactions';

import { useUser } from '@clerk/nextjs';
import { getAccounts } from '@/actions/Account/getAccounts';

import { TransactionModal } from './TransactionModal';
const TransactionList = dynamic(async () => (await import('./TransactionList')).TransactionList, { ssr: false });

export const TransactionCard: React.FC = () => {
  const { user } = useUser();
  const [idList, setIdList] = useState<string[]>([]);
  const { isOpen, onOpen, onOpenChange } = useDisclosure();

  const [ConfirmModal, confirm] = useConfirm({
    title: 'Delete Transaction',
    message:
      idList.length === 1
        ? 'Are you sure you want to delete this transaction?'
        : 'Are you sure you want to delete all these transactions?',
  });

  const { data: accountData } = useQuery({
    enabled: !!user?.id,
    queryKey: ['accounts'],
    queryFn: () => getAccounts(user?.id as string),
  });

  const { data: transactionData, isLoading } = useQuery({
    enabled: !!accountData,
    queryKey: ['transactions'],
    queryFn: () => getTransactions({ accountIds: accountData?.map((account) => account.id) ?? [] }),
  });

  const onDelete = async () => {
    const ok = await confirm();
    if (ok) {
      console.log('delete', idList);
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
              <p className="font-bold text-xl">Transaction History</p>
              <div className="flex gap-4 w-full sm:w-auto">
                {idList.length > 0 && (
                  <Button
                    color="warning"
                    variant="bordered"
                    onPress={onDelete}
                    // isDisabled={bulkDeleteMutation.isPending}
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
          <TransactionList isLoading={isLoading} selectedKeysFn={setIdList} transactionData={transactionData} />
        </CardBody>
      </Card>
      <TransactionModal isOpen={isOpen} onOpenChange={onOpenChange} />
      <ConfirmModal />
    </>
  );
};
