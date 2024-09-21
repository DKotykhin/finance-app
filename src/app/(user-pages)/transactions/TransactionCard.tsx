'use client';

import React, { useState } from 'react';
import { Button, Card, CardBody, CardHeader, Chip, Skeleton, useDisclosure } from '@nextui-org/react';
import { Plus, Trash2 } from 'lucide-react';
import dynamic from 'next/dynamic';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'react-toastify';
import { useUser } from '@clerk/nextjs';
import { SubscriptionType } from '@prisma/client';

import { useConfirm } from '@/hooks/use-confirm';
import { bulkDeleteTransactions, getTodaysTransactions } from '@/actions/Transaction/_index';
import { getUserSettings } from '@/actions/UserSettings/getUserSettings';
import { getAccounts } from '@/actions/Account/_index';
import { freeLimits } from '@/utils/const';

import { TransactionModal } from './TransactionModal';
import { SubscriptionModal } from '@/components/SubscriptionModal';
const TransactionList = dynamic(async () => (await import('./TransactionList')).TransactionList, { ssr: false });

export const TransactionCard: React.FC = () => {
  const queryClient = useQueryClient();
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

  const { data: userSettingsData, isLoading: isUserSettingsLoading } = useQuery({
    enabled: !!user?.id,
    queryKey: ['userSettings'],
    queryFn: () => getUserSettings({ userId: user?.id as string }),
  });

  const { data: accountData, isLoading: isAccountLoading } = useQuery({
    enabled: !!user?.id,
    queryKey: ['accounts'],
    queryFn: () => getAccounts(user?.id as string),
  });

  const { data: todaysTransactionsData, isLoading: isTodaysTransactionsLoading } = useQuery({
    enabled:
      !!user?.id &&
      !isUserSettingsLoading &&
      !isAccountLoading &&
      userSettingsData?.subscriptionType === SubscriptionType.Free,
    queryKey: ['todaysTransactionsData'],
    queryFn: () => getTodaysTransactions({ accountIds: accountData?.map((account) => account.id) ?? [] }),
  });

  const bulkDeleteMutation = useMutation({
    mutationFn: (idList: string[]) => bulkDeleteTransactions(idList),
    onSuccess: () => {
      setIdList([]);
      toast.success('Transactions deleted successfully');
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
                    isDisabled={bulkDeleteMutation.isPending}
                    className="w-full sm:w-auto"
                  >
                    <Trash2 size={16} />
                    Delete ({idList.length})
                  </Button>
                )}
                <Button
                  color="secondary"
                  onPress={
                    userSettingsData?.subscriptionType === SubscriptionType.Free &&
                    (todaysTransactionsData?.length ?? 0) >= freeLimits.transactions &&
                    !isTodaysTransactionsLoading
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
            userSettingsData={userSettingsData}
            isUserSettingsLoading={isUserSettingsLoading}
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
