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
  Tooltip,
} from '@nextui-org/react';
import type { Mode, Resolver, SubmitHandler} from 'react-hook-form';
import { Controller, useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { toast } from 'react-toastify';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Info } from 'lucide-react';

import { Currency } from '@prisma/client';

import type { AccountFormTypes} from '@/validation/accountValidation';
import { accountFormValidationSchema } from '@/validation/accountValidation';
import { createAccount, updateAccount } from '@/actions/Account/_index';

import type { AccountUpdate } from './AccountList';

interface AccountModalProps {
  isOpen: boolean;
  onOpenChange: () => void;
  account?: AccountUpdate | null;
}

interface AccountFormValidationTypes {
  defaultValues: AccountFormTypes;
  resolver: Resolver<any>;
  mode: Mode;
}

const AccountFormValidation: AccountFormValidationTypes = {
  defaultValues: {
    accountName: '',
    currency: Currency.USD,
    hideDecimal: false,
    isDefault: false,
  },
  resolver: zodResolver(accountFormValidationSchema),
  mode: 'onSubmit',
};

export const AccountModal: React.FC<AccountModalProps> = ({ isOpen, onOpenChange, account }) => {
  const queryClient = useQueryClient();

  useEffect(() => {
    reset({
      accountName: account?.accountName || '',
      currency: account?.currency || Currency.USD,
      hideDecimal: account?.hideDecimal || false,
      isDefault: account?.isDefault || false,
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen]);

  const createMutation = useMutation({
    mutationFn: ({ accountData }: { accountData: AccountFormTypes }) => createAccount({ accountData }),
    onSuccess: data => {
      reset();
      onOpenChange();
      toast.success(`Account ${data.accountName} created successfully`);
      queryClient.invalidateQueries({ queryKey: ['accounts'] });
    },
    onError: error => {
      toast.error(error.message);
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ accountId, accountData }: { accountId: string; accountData: AccountFormTypes }) =>
      updateAccount({ accountId, accountData }),
    onSuccess: data => {
      reset();
      onOpenChange();
      toast.success(`Account ${data.accountName} updated successfully`);
      Promise.all([
        queryClient.invalidateQueries({ queryKey: ['accounts'] }),
        queryClient.invalidateQueries({
          queryKey: ['transactions'],
        }),
        queryClient.invalidateQueries({
          queryKey: ['transactionsWithStat'],
        }),
        queryClient.invalidateQueries({
          queryKey: ['previousTransactionsWithStat'],
        }),
      ]);
    },
    onError: error => {
      toast.error(error.message);
    },
  });

  const {
    control,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<AccountFormTypes>(AccountFormValidation);

  const onSubmit: SubmitHandler<AccountFormTypes> = async accountData => {
    if (
      account?.accountName === accountData.accountName &&
      account?.currency === accountData.currency &&
      account?.hideDecimal === accountData.hideDecimal &&
      account?.isDefault === accountData.isDefault
    ) {
      toast.info('No changes detected');

      return;
    }

    account?.id
      ? updateMutation.mutateAsync({ accountId: account?.id as string, accountData })
      : createMutation.mutateAsync({ accountData });
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
        {onClose => (
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
                      {Object.values(Currency).map(currency => (
                        <SelectItem key={currency}>{currency}</SelectItem>
                      ))}
                    </Select>
                  )}
                />
                <div className="flex flex-col sm:flex-row gap-2 justify-around mt-4">
                  <div className="flex gap-2 items-center">
                    <Controller
                      name="hideDecimal"
                      control={control}
                      defaultValue={false}
                      render={({ field }) => (
                        <Checkbox
                          {...field}
                          value={field.value.toString()}
                          defaultSelected={account?.hideDecimal || false}
                        >
                          Hide decimal
                        </Checkbox>
                      )}
                    />
                    <Tooltip
                      content="Hide decimal sign to account balance and transactions"
                      color="primary"
                      className="max-w-[200px]"
                    >
                      <Info size={16} color="#2563eb" />
                    </Tooltip>
                  </div>
                  <div className="flex gap-2 items-center">
                    <Controller
                      name="isDefault"
                      control={control}
                      defaultValue={false}
                      render={({ field }) => (
                        <Checkbox
                          {...field}
                          value={field.value.toString()}
                          defaultSelected={account?.isDefault || false}
                        >
                          {account?.isDefault ? 'Default account' : 'Set as default'}
                        </Checkbox>
                      )}
                    />
                    <Tooltip
                      content="Set as default account for all transactions"
                      color="primary"
                      className="max-w-[200px]"
                    >
                      <Info size={16} color="#2563eb" />
                    </Tooltip>
                  </div>
                </div>
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
