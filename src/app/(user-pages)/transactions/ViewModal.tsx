'use client';

import React from 'react';

import { Badge, Button, Chip, Modal, ModalBody, ModalContent, ModalFooter, ModalHeader } from '@nextui-org/react';
import { format } from 'date-fns';

import { TriangleAlert } from 'lucide-react';

import { cn, currencyMap, numberWithSpaces } from '@/utils/_index';
import type { ExtendedTransaction } from '@/actions/Transaction/getTransactions';

interface ViewModalProps {
  isOpen: boolean;
  onOpenChange: () => void;
  transaction: ExtendedTransaction | null;
}

export const ViewModal: React.FC<ViewModalProps> = ({ isOpen, onOpenChange, transaction }) => {
  return (
    <Modal isOpen={isOpen} onOpenChange={onOpenChange}>
      <ModalContent>
        {onClose => (
          <>
            <ModalHeader className="flex justify-center">{'Transaction Details'}</ModalHeader>
            <ModalBody>
              <div className="flex flex-col gap-4">
                <div className="flex justify-between w-full">
                  <p>Amount</p>
                  <div className="flex gap-1 items-center">
                    <div className={transaction && transaction.amount < 0 ? 'text-red-500' : ''}>
                      {transaction && currencyMap.get(transaction.account.currency)?.sign}
                    </div>
                    <div className={cn('font-semibold', transaction && transaction.amount < 0 ? 'text-red-500' : '')}>
                      {numberWithSpaces(
                        transaction && transaction.account.hideDecimal
                          ? Math.round(transaction.amount ?? 0)
                          : (transaction?.amount ?? 0)
                      )}
                    </div>
                  </div>
                </div>
                <div className="flex justify-between w-full">
                  <p>Date</p>
                  <p className="text-sm font-bold">{format(new Date(transaction?.date || ''), 'dd MMM, yyyy')}</p>
                </div>
                <div className="flex justify-between w-full">
                  <p>Created</p>
                  <p className="text-sm font-bold">{format(new Date(transaction?.createdAt || ''), 'dd MMM, yyyy')}</p>
                </div>
                <div className="flex justify-between w-full">
                  <p>Updated</p>
                  <p className="text-sm font-bold">{format(new Date(transaction?.updatedAt || ''), 'dd MMM, yyyy')}</p>
                </div>
                <div className="flex justify-between w-full">
                  <p>Category</p>
                  <Chip
                    color={transaction?.category?.categoryName ? 'secondary' : 'danger'}
                    variant={transaction?.category?.categoryName ? 'faded' : 'light'}
                  >
                    {transaction?.category?.categoryName ?? (
                      <p className="flex gap-1">
                        <TriangleAlert size={18} /> <span>Uncategorized</span>
                      </p>
                    )}
                  </Chip>
                </div>
                <div className="flex justify-between w-full">
                  <p>Account</p>
                  <Badge content="" isInvisible={!transaction?.account.isDefault} color="primary">
                    <p className="text-sm py-0.5 px-3 border-2 bg-slate-100 border-slate-300 rounded-full truncate md:text-clip text-ellipsis max-w-[160px] md:max-w-fit text-blue-700">
                      {transaction?.account?.accountName}
                    </p>
                  </Badge>
                </div>
                <div className="w-full">
                  <p>Notes</p>
                  <p className="text-sm text-gray-600 italic">{transaction?.notes}</p>
                </div>
              </div>
            </ModalBody>
            <ModalFooter>
              <Button type="button" color="default" variant="light" onPress={onClose}>
                Close
              </Button>
            </ModalFooter>
          </>
        )}
      </ModalContent>
    </Modal>
  );
};
