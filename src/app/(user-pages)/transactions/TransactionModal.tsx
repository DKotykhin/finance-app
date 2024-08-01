'use client';

import React, { useEffect, useMemo, useState } from 'react';
import {
  Button,
  Chip,
  DatePicker,
  Input,
  Modal,
  ModalBody,
  ModalContent,
  ModalFooter,
  ModalHeader,
  Select,
  Selection,
  SelectItem,
  Textarea,
} from '@nextui-org/react';
import { DateValue, getLocalTimeZone, parseAbsoluteToLocal } from '@internationalized/date';
import { Controller, Mode, Resolver, SubmitHandler, useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { toast } from 'react-toastify';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useUser } from '@clerk/nextjs';

import { getAccounts } from '@/actions/Account/getAccounts';
import { getCategories } from '@/actions/Category/getCategories';
import { createTransaction } from '@/actions/Transaction/createTransaction';
import { TransactionFormTypes, transactionFormValidationSchema } from '@/validation/transactionValidation';
import { currencyMap } from '../accounts/const';

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
  const [accountValue, setAccountValue] = useState<Selection>(new Set([]));
  const [categoryValue, setCategoryValue] = useState<Selection>(new Set([]));

  const { data: accountData, isLoading: isAccountLoading } = useQuery({
    enabled: !!user?.id,
    queryKey: ['accounts'],
    queryFn: () => getAccounts(user?.id as string),
  });

  useEffect(() => {
    if (accountData && accountData.length > 0) {
      const defaultAccountId = accountData.find((account) => account.isDefault)?.id;
      if (defaultAccountId) {
        setAccountValue(new Set([defaultAccountId]));
      }
    }
  }, [accountData]);

  const currencySign = useMemo(() => {
    const acc = accountData && accountData.find((account) => account.id === Array.from(accountValue)[0]);
    return acc?.currency ? currencyMap.get(acc.currency)?.sign : '';
  }, [accountData, accountValue]);

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
        date: dateValue?.toDate(getLocalTimeZone()),
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
    if (!dateValue) return;
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
                <DatePicker
                  label="Date"
                  granularity="day"
                  value={dateValue}
                  onChange={setDateValue}
                  isRequired
                  isInvalid={!dateValue}
                  errorMessage="Please select a date"
                />
                <Controller
                  name="amount"
                  control={control}
                  render={({ field }) => (
                    <Input
                      {...field}
                      isRequired
                      type="number"
                      label="Amount"
                      placeholder="0.00"
                      step={0.01}
                      startContent={
                        currencySign ? (
                          <Chip
                            size="sm"
                            variant="flat"
                            color={+field.value === 0 ? 'default' : +field.value > 0 ? 'success' : 'danger'}
                            onClick={() => field.onChange(+field.value * -1)}
                            className="cursor-pointer"
                          >
                            {currencySign}
                          </Chip>
                        ) : null
                      }
                      isInvalid={!!errors.amount}
                      errorMessage={errors.amount?.message}
                    />
                  )}
                />
                {accountData && accountData.length > 0 && (
                  <Controller
                    name="accountId"
                    control={control}
                    render={({ field }) => (
                      <Select
                        {...field}
                        items={accountData}
                        label="Select an account"
                        isLoading={isAccountLoading}
                        isDisabled={isAccountLoading}
                        isInvalid={!!errors.accountId}
                        errorMessage={errors.accountId?.message}
                        selectedKeys={accountValue}
                        onSelectionChange={setAccountValue}
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
                        items={categoryData}
                        label="Select a category"
                        isLoading={isCategoryLoading}
                        isDisabled={isCategoryLoading}
                        isInvalid={!!errors.categoryId}
                        errorMessage={errors.categoryId?.message}
                        selectedKeys={categoryValue}
                        onSelectionChange={setCategoryValue}
                      >
                        {(category) => <SelectItem key={category.id}>{category.name}</SelectItem>}
                      </Select>
                    )}
                  />
                )}
                <Controller
                  name="notes"
                  control={control}
                  render={({ field }) => (
                    <Textarea
                      {...field}
                      type="text"
                      label="Notes"
                      placeholder="Optional notes"
                      isInvalid={!!errors.notes}
                      errorMessage={errors.notes?.message}
                    />
                  )}
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
