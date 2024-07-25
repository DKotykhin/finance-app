'use client';

import React from 'react';
import { Button, Card, CardHeader, useDisclosure } from '@nextui-org/react';
import { Plus } from 'lucide-react';

import { AccountModal } from './AccountModal';

export const AddAccountCard: React.FC = () => {
  const { isOpen, onOpen, onOpenChange } = useDisclosure();

  const handlePress = () => {
    onOpen();
  };

  return (
    <>
      <Card className="-mt-24 mx-2 md:mx-10 p-1">
        <CardHeader className="flex flex-col sm:flex-row gap-4 justify-between items-start sm:items-center">
          <p className="font-bold text-lg">Account page</p>
          <Button color="secondary" onPress={handlePress} className="w-full sm:w-auto">
            <Plus size={16} />
            Add New
          </Button>
        </CardHeader>
      </Card>
      <AccountModal isOpen={isOpen} onOpenChange={onOpenChange} />
    </>
  );
};
