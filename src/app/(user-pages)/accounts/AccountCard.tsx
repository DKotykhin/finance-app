'use client';

import React from 'react';
import { Button, Card, CardBody, CardHeader, Skeleton, useDisclosure } from '@nextui-org/react';
import { useQuery } from '@tanstack/react-query';
import { Plus } from 'lucide-react';

import { getUserAccounts } from '@/actions/Account/_index';
import { AccountModal } from './AccountModal';
import { AccountTable } from './AccountTable';

export const AccountCard: React.FC<{ userId: string | null }> = ({ userId }) => {
  const { isOpen, onOpen, onOpenChange } = useDisclosure();

  const { data: accountData, isLoading } = useQuery({
    enabled: !!userId,
    queryKey: ['accounts'],
    queryFn: () => getUserAccounts(userId as string),
  });

  return (
    <>
      <Card className="-mt-24 mb-12 mx-2 md:mx-10 p-1">
        <CardHeader className="flex flex-col sm:flex-row gap-4 justify-between items-start sm:items-center">
          {isLoading ? (
            <>
              <Skeleton className="w-[200px] h-10 rounded-lg bg-slate-100"></Skeleton>
              <Skeleton className="w-[200px] h-10 rounded-lg bg-slate-100"></Skeleton>
            </>
          ) : (
            <>
              <p className="font-bold text-xl">Account page</p>
              <Button color="secondary" onPress={onOpen} className="w-full sm:w-auto">
                <Plus size={16} />
                Add New
              </Button>
            </>
          )}
        </CardHeader>
        <CardBody>
          <AccountTable accountData={accountData} isLoading={isLoading} />
        </CardBody>
      </Card>
      <AccountModal isOpen={isOpen} onOpenChange={onOpenChange} />
    </>
  );
};
