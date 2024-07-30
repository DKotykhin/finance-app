'use client';

import React, { useState } from 'react';
import { Button, Card, CardBody, CardHeader, Skeleton, useDisclosure } from '@nextui-org/react';
import { Plus } from 'lucide-react';

import { useConfirm } from '@/hooks/use-confirm';
import { TransactionModal } from './TransactionModal';

export const TransactionCard: React.FC = () => {
  const [idList, setIdList] = useState<string[]>([]);
  const { isOpen, onOpen, onOpenChange } = useDisclosure();

  const [ConfirmModal, confirm] = useConfirm({
    title: 'Delete Transaction',
    message:
      idList.length === 1
        ? 'Are you sure you want to delete this transaction?'
        : 'Are you sure you want to delete all these transactions?',
  });

  const isLoading = false;

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
                <Button color="secondary" onPress={onOpen} className="w-full sm:w-auto">
                  <Plus size={16} />
                  Add New
                </Button>
              </div>
            </>
          )}
        </CardHeader>
        <CardBody></CardBody>
      </Card>
      <TransactionModal isOpen={isOpen} onOpenChange={onOpenChange} />
      <ConfirmModal />
    </>
  );
};
