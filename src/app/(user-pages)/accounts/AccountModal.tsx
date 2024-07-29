'use client';

import React, { useEffect } from 'react';
import {
  Button,
  Checkbox,
  Input,
  Modal,
  ModalBody,
  ModalContent,
  ModalFooter,
  ModalHeader,
  Select,
  SelectItem,
} from '@nextui-org/react';
import { Controller, Mode, Resolver, SubmitHandler, useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { toast } from 'react-toastify';
import { useUser } from '@clerk/nextjs';
import { useMutation, useQueryClient } from '@tanstack/react-query';

import { AccountFormTypes, accountFormValidationSchema } from '@/validation/accountValidation';
import { createAccount, updateAccount } from '@/actions/Account/_index';
import { Currency } from '@prisma/client';

import { AccountUpdate } from './AccountList';

interface AccountFormValidationTypes {
  defaultValues: AccountFormTypes;
  resolver: Resolver<any>;
  mode: Mode;
}

interface AccountModalProps {
  isOpen: boolean;
  onOpenChange: () => void;
  account?: AccountUpdate | null;
}

const AccountFormValidation: AccountFormValidationTypes = {
  defaultValues: {
    accountName: '',
    currency: Currency.USD,
    hideDecimal: false,
  },
  resolver: zodResolver(accountFormValidationSchema),
  mode: 'onSubmit',
};

export const AccountModal: React.FC<AccountModalProps> = ({ isOpen, onOpenChange, account }) => {
  const { user } = useUser();
  const queryClient = useQueryClient();

  useEffect(() => {
    reset({
      accountName: account?.accountName || '',
      currency: account?.currency || Currency.USD,
      hideDecimal: account?.hideDecimal || false,
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [account?.accountName, account?.currency, account?.hideDecimal]);

  const createMutation = useMutation({
    mutationFn: ({ userId, accountData }: { userId: string; accountData: AccountFormTypes }) =>
      createAccount({ userId, accountData }),
    onSuccess: (data) => {
      reset();
      onOpenChange();
      toast.success(`Account ${data.accountName} created successfully`);
      queryClient.invalidateQueries({ queryKey: ['accounts'] });
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ accountId, accountData }: { accountId: string; accountData: AccountFormTypes }) =>
      updateAccount({ accountId, accountData }),
    onSuccess: (data) => {
      reset();
      onOpenChange();
      toast.success(`Account ${data.accountName} updated successfully`);
      queryClient.invalidateQueries({ queryKey: ['accounts'] });
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
  } = useForm<AccountFormTypes>(AccountFormValidation);

  const onSubmit: SubmitHandler<AccountFormTypes> = async (accountData) => {
    if (
      account?.accountName === accountData.accountName &&
      account?.currency === accountData.currency &&
      account?.hideDecimal === accountData.hideDecimal
    ) {
      toast.info('No changes detected');
      return;
    }
    account?.id
      ? updateMutation.mutateAsync({ accountId: account?.id as string, accountData })
      : createMutation.mutateAsync({ userId: user?.id as string, accountData });
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
              {account?.id ? 'Update Account' : 'Create New Account'}
            </ModalHeader>
            <form className="w-full" onSubmit={handleSubmit(onSubmit)}>
              <ModalBody>
                <Controller
                  name="accountName"
                  control={control}
                  render={({ field }) => (
                    <Input
                      {...field}
                      isRequired
                      autoFocus
                      type="text"
                      label="Account name"
                      labelPlacement="outside"
                      placeholder="Enter account name"
                      description="e.g. Personal, Business, Savings"
                      isInvalid={!!errors.accountName}
                      errorMessage={errors.accountName?.message}
                    />
                  )}
                />
                <Controller
                  name="currency"
                  control={control}
                  defaultValue={Currency.USD}
                  render={({ field }) => (
                    <Select
                      {...field}
                      label="Select Currency"
                      labelPlacement="outside"
                      defaultSelectedKeys={[account?.currency || Currency.USD]}
                    >
                      {Object.values(Currency).map((currency) => (
                        <SelectItem key={currency}>{currency}</SelectItem>
                      ))}
                    </Select>
                  )}
                />
                <Controller
                  name="hideDecimal"
                  control={control}
                  defaultValue={false}
                  render={({ field }) => (
                    <Checkbox
                      {...field}
                      value={field.value.toString()}
                      className="mt-2"
                      defaultSelected={account?.hideDecimal || false}
                    >
                      Hide decimal
                    </Checkbox>
                  )}
                />
              </ModalBody>
              <ModalFooter>
                <Button type="button" color="default" variant="light" onPress={onClose}>
                  Cancel
                </Button>
                <Button type="submit" color="primary" isDisabled={createMutation.isPending || updateMutation.isPending}>
                  {account?.id ? 'Update' : 'Create'}
                </Button>
              </ModalFooter>
            </form>
          </>
        )}
      </ModalContent>
    </Modal>
  );
};
