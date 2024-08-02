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

import { getCategories } from '@/actions/Category/_index';
import { getAccounts } from '@/actions/Account/_index';
import { createTransaction, updateTransaction } from '@/actions/Transaction/_index';
import { TransactionFormTypes, transactionFormValidationSchema } from '@/validation/transactionValidation';
import { currencyMap } from '@/utils/_index';

import { TransactionUpdate } from './TransactionList';

interface TransactionModalProps {
  isOpen: boolean;
  onOpenChange: () => void;
  transaction?: TransactionUpdate | null;
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

  const { data: categoryData, isLoading: isCategoryLoading } = useQuery({
    enabled: !!user?.id,
    queryKey: ['categories'],
    queryFn: () => getCategories({ userId: user?.id as string }),
  });

  useEffect(() => {
    if (accountData && accountData.length > 0 && !transaction?.id) {
      const defaultAccountId = accountData.find((account) => account.isDefault)?.id;
      if (defaultAccountId) {
        setAccountValue(new Set([defaultAccountId]));
        reset({ accountId: defaultAccountId, categoryId: Array.from(categoryValue).toString() });
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen]);

  useEffect(() => {
    transaction?.categoryId ? setCategoryValue(new Set([transaction?.categoryId])) : setCategoryValue(new Set([]));
    transaction?.accountId ? setAccountValue(new Set([transaction?.accountId])) : setAccountValue(new Set([]));
    transaction?.date
      ? setDateValue(parseAbsoluteToLocal(transaction?.date.toISOString()))
      : setDateValue(parseAbsoluteToLocal(new Date().toISOString()));
    reset({
      amount: transaction?.amount ? transaction?.amount.toString() : '',
      notes: transaction?.notes || '',
      categoryId: transaction?.categoryId || '',
      accountId: transaction?.accountId || '',
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [transaction]);

  const currencySign = useMemo(() => {
    const acc = accountData && accountData.find((account) => account.id === Array.from(accountValue)[0]);
    return acc?.currency ? currencyMap.get(acc.currency)?.sign : '';
  }, [accountData, accountValue]);

  const createMutation = useMutation({
    mutationFn: ({ transactionData }: { transactionData: Omit<TransactionUpdate, 'id'> }) =>
      createTransaction(transactionData),
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

  const updateMutation = useMutation({
    mutationFn: ({
      transactionId,
      transactionData,
    }: {
      transactionId: string;
      transactionData: Omit<TransactionUpdate, 'id'>;
    }) => updateTransaction({ transactionId, transactionData }),
    onSuccess: () => {
      reset();
      onOpenChange();
      toast.success(`Transaction updated successfully`);
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
    const notes1 = transaction?.notes ? transaction.notes : '';
    const notes2 = transactionData.notes ? transactionData.notes : '';
    if (
      notes1 === notes2 &&
      transaction?.amount === parseFloat(transactionData.amount) &&
      transaction?.categoryId === transactionData.categoryId &&
      transaction?.accountId === transactionData.accountId &&
      transaction?.date.toISOString() === dateValue?.toDate(getLocalTimeZone()).toISOString()
    ) {
      toast.info('No changes detected');
      return;
    }
    transaction?.id
      ? updateMutation.mutate({
          transactionId: transaction.id,
          transactionData: {
            ...transactionData,
            date: dateValue?.toDate(getLocalTimeZone()),
            amount: Math.round(parseFloat(transactionData.amount) * 100) / 100,
            notes: transactionData.notes || null,
          },
        })
      : createMutation.mutate({
          transactionData: {
            ...transactionData,
            date: dateValue?.toDate(getLocalTimeZone()),
            amount: Math.round(parseFloat(transactionData.amount) * 100) / 100,
            notes: transactionData.notes || null,
          },
        });
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
              {transaction?.id ? 'Update Transaction' : 'Create New Transaction'}
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
                            color={+field?.value ? (+field.value > 0 ? 'success' : 'danger') : 'default'}
                            onClick={() => field.value && field.onChange(+field.value * -1)}
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
                  {transaction?.id ? 'Update' : 'Create'}
                </Button>
              </ModalFooter>
            </form>
          </>
        )}
      </ModalContent>
    </Modal>
  );
};
