'use client';

import React, { useState } from 'react';
import { Button, Card, CardBody, CardHeader, Chip, Skeleton, useDisclosure } from '@nextui-org/react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Plus, Trash2 } from 'lucide-react';
import { toast } from 'react-toastify';
import dynamic from 'next/dynamic';
import { SubscriptionType } from '@prisma/client';

import { bulkDeleteAccounts, getAccounts } from '@/actions/Account/_index';
import { getUserSettings } from '@/actions/UserSettings/getUserSettings';
import { useConfirm } from '@/hooks/use-confirm';
import { freeLimits } from '@/utils/_index';
import { SubscriptionModal } from '@/components/SubscriptionModal';

import { AccountModal } from './AccountModal';
const AccountList = dynamic(async () => (await import('./AccountList')).AccountList, { ssr: false });

export const AccountCard: React.FC<{ userId: string | null }> = ({ userId }) => {
  const [idList, setIdList] = useState<string[]>([]);
  const [accountListLength, setAccountListLength] = useState(0);

  const { isOpen: isAccountOpen, onOpen: onAccountOpen, onOpenChange: onAccountOpenChange } = useDisclosure();
  const {
    isOpen: isSubscriptionOpen,
    onOpen: onSubscriptionOpen,
    onOpenChange: onSubscriptionOpenChange,
  } = useDisclosure();

  const queryClient = useQueryClient();

  const [ConfirmModal, confirm] = useConfirm({
    title: 'Delete Account',
    message:
      idList.length === 1
        ? 'Are you sure you want to delete this account?'
        : 'Are you sure you want to delete all these accounts?',
  });

  const { data: accountData, isLoading: isAccountLoading } = useQuery({
    enabled: !!userId,
    queryKey: ['accounts'],
    queryFn: () => getAccounts(userId as string),
  });

  const { data: userSettingsData, isLoading: isUserSettingsLoading } = useQuery({
    enabled: !!userId,
    queryKey: ['userSettings'],
    queryFn: () => getUserSettings({ userId: userId as string }),
  });

  const bulkDeleteMutation = useMutation({
    mutationFn: (idList: string[]) => bulkDeleteAccounts(idList),
    onSuccess: () => {
      setIdList([]);
      toast.success('Accounts deleted successfully');
      queryClient.invalidateQueries({ queryKey: ['accounts'] });
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
          {isAccountLoading ? (
            <>
              <Skeleton className="w-[200px] h-10 rounded-lg bg-slate-100"></Skeleton>
              <Skeleton className="w-[200px] h-10 rounded-lg bg-slate-100"></Skeleton>
            </>
          ) : (
            <>
              <div className="flex items-center gap-4">
                <p className="font-bold text-xl">Account page</p>
                {accountListLength > 0 && (
                  <Chip radius="md" color="secondary">
                    {accountListLength}
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
                    (accountData?.length ?? 0) >= freeLimits.accounts
                      ? onSubscriptionOpen
                      : onAccountOpen
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
          <AccountList
            accountData={accountData}
            isAccountLoading={isAccountLoading}
            selectedKeysFn={setIdList}
            accountListLengthFn={setAccountListLength}
            userSettingsData={userSettingsData}
            isUserSettingsLoading={isUserSettingsLoading}
          />
        </CardBody>
      </Card>
      <AccountModal isOpen={isAccountOpen} onOpenChange={onAccountOpenChange} />
      <SubscriptionModal
        isOpen={isSubscriptionOpen}
        onOpenChange={onSubscriptionOpenChange}
        userId={userId}
        title={`You can't create more than ${freeLimits.accounts} accounts on FREE plan`}
      />
      <ConfirmModal />
    </>
  );
};
