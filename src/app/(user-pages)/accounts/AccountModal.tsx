'use client';

import React, { useEffect, useState } from 'react';

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
import type { Mode, Resolver, SubmitHandler } from 'react-hook-form';
import { Controller, useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { toast } from 'react-toastify';
import { Info } from 'lucide-react';

import { Currency } from '@prisma/client';

import type { AccountFormTypes } from '@/validation';
import { accountFormValidationSchema } from '@/validation';
import { useFetchAccount } from '@/hooks';
import { colorsMap } from '@/utils';

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
    color: 'slate',
  },
  resolver: zodResolver(accountFormValidationSchema),
  mode: 'onSubmit',
};

export const AccountModal: React.FC<AccountModalProps> = ({ isOpen, onOpenChange, account }) => {
  const [currentColor, setCurrentColor] = useState<string>(account?.color || 'slate');

  const { createAccount, updateAccount } = useFetchAccount();

  useEffect(() => {
    reset({
      accountName: account?.accountName || '',
      currency: account?.currency || Currency.USD,
      hideDecimal: account?.hideDecimal || false,
      isDefault: account?.isDefault || false,
      color: account?.color || 'slate',
    });
    setCurrentColor(account?.color || 'slate');
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen]);

  useEffect(() => {
    if (createAccount.isSuccess || updateAccount.isSuccess) {
      onOpenChange();
      reset();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [createAccount.isSuccess, updateAccount.isSuccess]);

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
      account?.isDefault === accountData.isDefault &&
      account?.color === currentColor
    ) {
      toast.info('No changes detected');

      return;
    }

    account?.id
      ? updateAccount.mutateAsync({
          accountId: account?.id as string,
          accountData: { ...accountData, color: currentColor },
        })
      : createAccount.mutateAsync({ ...accountData, color: currentColor });
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
                      isRequired
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
                <p className="text-sm">Appearance</p>
                <div className="flex flex-col items-center gap-2">
                  <div className="flex items-center gap-2">
                    {Array.from(colorsMap.entries()).map(([colorName, colorValue]) => (
                      <Tooltip key={colorName} content={colorName}>
                        <div
                          className="border-2 rounded-full p-0.5 cursor-pointer"
                          onClick={() => setCurrentColor(colorName)}
                          style={{ borderColor: currentColor === colorName ? colorValue.sample : 'white' }}
                        >
                          <div className={`w-6 h-6 rounded-full`} style={{ backgroundColor: colorValue.sample }} />
                        </div>
                      </Tooltip>
                    ))}
                  </div>
                  <p
                    className="py-0.5 px-3 border-2 rounded-full"
                    style={{
                      color: colorsMap.get(currentColor)?.text,
                      borderColor: colorsMap.get(currentColor)?.border,
                      backgroundColor: colorsMap.get(currentColor)?.bg,
                    }}
                  >
                    Account Name
                  </p>
                </div>
                <div className="flex flex-col sm:flex-row gap-2 justify-around mt-3">
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
                <Button type="submit" color="primary" isDisabled={createAccount.isPending || updateAccount.isPending}>
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
