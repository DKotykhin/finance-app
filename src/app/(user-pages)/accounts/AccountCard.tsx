'use client';

import React from 'react';
import { Button, Card, CardBody, CardHeader, CircularProgress, Skeleton, useDisclosure } from '@nextui-org/react';
import { useQuery } from '@tanstack/react-query';
import { Plus } from 'lucide-react';

import { getUserAccounts } from '@/actions/Account/_index';
import { AccountModal } from './AccountModal';
import { AccountList } from './AccountList';

export const AccountCard: React.FC<{ userId: string | null }> = ({ userId }) => {
  const { isOpen, onOpen, onOpenChange } = useDisclosure();

  const { data: accountData, isLoading } = useQuery({
    enabled: !!userId,
    queryKey: ['accounts'],
    queryFn: () => getUserAccounts(userId as string),
  });

  return isLoading ? (
    <Card className="-mt-24 mx-2 md:mx-10 p-1">
      <CardHeader className="flex flex-col sm:flex-row gap-4 justify-between items-start sm:items-center">
        <Skeleton className="w-[200px] h-10 rounded-lg bg-slate-100"></Skeleton>
        <Skeleton className="w-[200px] h-10 rounded-lg bg-slate-100"></Skeleton>
      </CardHeader>
      <CardBody>
        <div className="flex justify-center mt-12">
          <CircularProgress aria-label="Loading..." />
        </div>
      </CardBody>
    </Card>
  ) : (
    <>
      <Card className="-mt-24 mx-2 md:mx-10 p-1">
        <CardHeader className="flex flex-col sm:flex-row gap-4 justify-between items-start sm:items-center">
          <p className="font-bold text-xl">Account page</p>
          <Button color="secondary" onPress={onOpen} className="w-full sm:w-auto">
            <Plus size={16} />
            Add New
          </Button>
        </CardHeader>
        <CardBody>
          <AccountList accountData={accountData} />
        </CardBody>
      </Card>
      <AccountModal isOpen={isOpen} onOpenChange={onOpenChange} />
    </>
  );
};
