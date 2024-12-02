'use client';

import React, { useEffect, useState } from 'react';

import dynamic from 'next/dynamic';

import { Button, Card, CardBody, CardHeader, Chip, Skeleton, useDisclosure } from '@nextui-org/react';
import { Plus, Trash2 } from 'lucide-react';
import { useUser } from '@clerk/nextjs';

import { freeLimits } from '@/utils';
import { useConfirm, useFetchAccount, useFetchSettings, useFetchSubscription, useFetchTransaction } from '@/hooks';
import { SubscriptionModal } from '@/components/SubscriptionModal';

import { TransactionModal } from './TransactionModal';

const TransactionList = dynamic(async () => (await import('./TransactionList')).TransactionList, { ssr: false });

export const TransactionCard: React.FC = () => {
  const { user } = useUser();

  const [idList, setIdList] = useState<string[]>([]);
  const [transactionListLength, setTransactionListLength] = useState(0);

  const { isOpen, onOpen, onOpenChange } = useDisclosure();

  const {
    isOpen: isSubscriptionOpen,
    onOpen: onSubscriptionOpen,
    onOpenChange: onSubscriptionOpenChange,
  } = useDisclosure();

  const [ConfirmModal, confirm] = useConfirm({
    title: 'Delete Transaction',
    message:
      idList.length === 1
        ? 'Are you sure you want to delete this transaction?'
        : 'Are you sure you want to delete all these transactions?',
  });

  const { accounts } = useFetchAccount(!!user?.id);
  const { userSettings } = useFetchSettings(!!user?.id);
  const { subscription } = useFetchSubscription(!!user?.id);

  const { todaysTransactions, bulkDeleteTransactions } = useFetchTransaction({
    accountData: accounts.data,
    enabled: !!user?.id && !userSettings.isLoading && !accounts.isLoading && !!subscription.data?.type,
  });

  useEffect(() => {
    if (bulkDeleteTransactions.isSuccess) {
      setIdList([]);
    }
  }, [bulkDeleteTransactions.isSuccess]);

  const onDelete = async () => {
    const ok = await confirm();

    if (ok) {
      bulkDeleteTransactions.mutateAsync(idList);
    }
  };

  return (
    <>
      <Card className="-mt-24 mb-12 p-1 sm:p-4">
        <CardHeader className="flex flex-col sm:flex-row gap-4 justify-between items-start sm:items-center">
          {!user ? (
            <>
              <Skeleton className="w-[200px] h-10 rounded-lg bg-slate-100"></Skeleton>
              <Skeleton className="w-[200px] h-10 rounded-lg bg-slate-100"></Skeleton>
            </>
          ) : (
            <>
              <div className="flex items-center gap-4">
                <p className="font-bold text-xl">Transaction History</p>
                {transactionListLength > 0 && (
                  <Chip radius="md" color="secondary">
                    {transactionListLength}
                  </Chip>
                )}
              </div>
              <div className="flex gap-4 w-full sm:w-auto">
                {idList.length > 0 && (
                  <Button
                    color="warning"
                    variant="bordered"
                    onPress={onDelete}
                    isLoading={bulkDeleteTransactions.isPending}
                    className="w-full sm:w-auto"
                  >
                    <Trash2 size={16} />
                    Delete ({idList.length})
                  </Button>
                )}
                <Button
                  color="secondary"
                  onPress={
                    (!subscription.data ||
                      (subscription.data.endDate && new Date(subscription.data.endDate) < new Date())) &&
                    (todaysTransactions.data?.length ?? 0) >= freeLimits.transactions &&
                    !todaysTransactions.isLoading
                      ? onSubscriptionOpen
                      : onOpen
                  }
                  className="w-full sm:w-auto"
                >
                  <Plus size={16} />
                  Add New
                </Button>
              </div>
            </>
          )}
        </CardHeader>
        <CardBody>
          <TransactionList
            selectedKeysFn={setIdList}
            transactionListLengthFn={setTransactionListLength}
            userSettingsData={userSettings.data}
            isUserSettingsLoading={userSettings.isLoading}
          />
        </CardBody>
      </Card>
      <TransactionModal isOpen={isOpen} onOpenChange={onOpenChange} />
      <ConfirmModal />
      <SubscriptionModal
        isOpen={isSubscriptionOpen}
        onOpenChange={onSubscriptionOpenChange}
        userId={user?.id}
        title={`You can't create more than ${freeLimits.transactions} transactions on FREE plan`}
      />
    </>
  );
};
