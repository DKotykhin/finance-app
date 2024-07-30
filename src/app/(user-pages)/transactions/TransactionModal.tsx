'use client';

import React, { useState } from 'react';
import {
  Button,
  DatePicker,
  Input,
  Modal,
  ModalBody,
  ModalContent,
  ModalFooter,
  ModalHeader,
  Select,
  SelectItem,
} from '@nextui-org/react';
import { DateValue, getLocalTimeZone, parseAbsoluteToLocal } from '@internationalized/date';
import { Controller, Mode, Resolver, SubmitHandler, useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { toast } from 'react-toastify';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useUser } from '@clerk/nextjs';

import { getAccounts } from '@/actions/Account/getAccounts';
import { getCategories } from '@/actions/Category/getCategories';
import { TransactionFormTypes, transactionFormValidationSchema } from '@/validation/transactionValidation';
import { createTransaction } from '@/actions/Transaction/createTransaction';

interface TransactionModalProps {
  isOpen: boolean;
  onOpenChange: () => void;
  transaction?: null;
}

interface TransactionFormValidationTypes {
  defaultValues: TransactionFormTypes;
  resolver: Resolver<any>;
  mode: Mode;
}

const TransactionFormValidation: TransactionFormValidationTypes = {
  defaultValues: {
    amount: '',
    notes: '',
    categoryId: '',
    accountId: '',
  },
  resolver: zodResolver(transactionFormValidationSchema),
  mode: 'onSubmit',
};

export const TransactionModal: React.FC<TransactionModalProps> = ({ isOpen, onOpenChange, transaction }) => {
  const { user } = useUser();
  const queryClient = useQueryClient();
  const [dateValue, setDateValue] = useState<DateValue>(parseAbsoluteToLocal(new Date().toISOString()));

  const { data: accountData, isLoading: isAccountLoading } = useQuery({
    enabled: !!user?.id,
    queryKey: ['accounts'],
    queryFn: () => getAccounts(user?.id as string),
  });

  const { data: categoryData, isLoading: isCategoryLoading } = useQuery({
    enabled: !!user?.id,
    queryKey: ['categories'],
    queryFn: () => getCategories({ userId: user?.id as string }),
  });

  const createMutation = useMutation({
    mutationFn: ({ transactionData }: { transactionData: TransactionFormTypes }) =>
      createTransaction({
        ...transactionData,
        amount: parseFloat(transactionData.amount),
        date: dateValue.toDate(getLocalTimeZone()),
      }),
    onSuccess: () => {
      reset();
      onOpenChange();
      toast.success(`Transaction created successfully`);
      queryClient.invalidateQueries({ queryKey: ['transactions'] });
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });

  const {
    control,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<TransactionFormTypes>(TransactionFormValidation);

  const onSubmit: SubmitHandler<TransactionFormTypes> = async (transactionData) => {
    createMutation.mutate({ transactionData });
  };

  return (
    <Modal
      isOpen={isOpen}
      onOpenChange={() => {
        onOpenChange(), reset();
      }}
      isDismissable={false}
    >
      <ModalContent>
        {(onClose) => (
          <>
            <ModalHeader className="flex justify-center">
              {transaction ? 'Update Transaction' : 'Create New Transaction'}
            </ModalHeader>
            <form className="w-full" onSubmit={handleSubmit(onSubmit)}>
              <ModalBody>
                {accountData && accountData.length > 0 && (
                  <Controller
                    name="accountId"
                    control={control}
                    render={({ field }) => (
                      <Select
                        {...field}
                        isRequired
                        items={accountData}
                        label="Select an account"
                        isLoading={isAccountLoading}
                        isDisabled={isAccountLoading}
                      >
                        {(account) => <SelectItem key={account.id}>{account.accountName}</SelectItem>}
                      </Select>
                    )}
                  />
                )}
                {categoryData && categoryData.length > 0 && (
                  <Controller
                    name="categoryId"
                    control={control}
                    render={({ field }) => (
                      <Select
                        {...field}
                        isRequired
                        items={categoryData}
                        label="Select a category"
                        isLoading={isCategoryLoading}
                        isDisabled={isCategoryLoading}
                      >
                        {(category) => <SelectItem key={category.id}>{category.name}</SelectItem>}
                      </Select>
                    )}
                  />
                )}
                <Controller
                  name="amount"
                  control={control}
                  render={({ field }) => (
                    <Input
                      {...field}
                      type="number"
                      label="Amount"
                      labelPlacement="outside"
                      placeholder="Enter amount"
                      isInvalid={!!errors.amount}
                      errorMessage={errors.amount?.message}
                    />
                  )}
                />
                <Controller
                  name="notes"
                  control={control}
                  render={({ field }) => (
                    <Input
                      {...field}
                      type="text"
                      label="Notes"
                      labelPlacement="outside"
                      placeholder="Enter notes"
                      isInvalid={!!errors.notes}
                      errorMessage={errors.notes?.message}
                    />
                  )}
                />
                <DatePicker
                  label="Date"
                  labelPlacement="outside"
                  granularity="day"
                  value={dateValue}
                  onChange={setDateValue}
                />
              </ModalBody>
              <ModalFooter>
                <Button type="button" color="default" variant="light" onPress={onClose}>
                  Cancel
                </Button>
                <Button type="submit" color="primary">
                  {transaction ? 'Update' : 'Create'}
                </Button>
              </ModalFooter>
            </form>
          </>
        )}
      </ModalContent>
    </Modal>
  );
};
