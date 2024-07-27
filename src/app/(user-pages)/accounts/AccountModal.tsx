'use client';

import React, { useEffect } from 'react';
import { Button, Input, Modal, ModalBody, ModalContent, ModalFooter, ModalHeader } from '@nextui-org/react';
import { Controller, Mode, Resolver, SubmitHandler, useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { toast } from 'react-toastify';
import { useUser } from '@clerk/nextjs';
import { useMutation, useQueryClient } from '@tanstack/react-query';

import { AccountFormTypes, accountFormValidationSchema } from '@/validation/accountValidation';
import { createAccount, updateAccount } from '@/actions/Account/_index';
import { AccountNameAndId } from './AccountTable';

interface AccountFormValidationTypes {
  defaultValues: AccountFormTypes;
  resolver: Resolver<any>;
  mode: Mode;
}

interface AccountModalProps {
  isOpen: boolean;
  onOpenChange: () => void;
  account?: AccountNameAndId | null;
}

const AccountFormValidation: AccountFormValidationTypes = {
  defaultValues: {
    accountName: '',
  },
  resolver: zodResolver(accountFormValidationSchema),
  mode: 'onSubmit',
};

export const AccountModal: React.FC<AccountModalProps> = ({ isOpen, onOpenChange, account }) => {
  const { user } = useUser();
  const queryClient = useQueryClient();

  useEffect(() => {
    reset({ accountName: account?.accountName || '' });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [account?.accountName]);

  const createMutation = useMutation({
    mutationFn: ({ userId, accountName }: { userId: string; accountName: string }) =>
      createAccount({ userId, accountName }),
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
    mutationFn: ({ accountId, accountName }: { accountId: string; accountName: string }) =>
      updateAccount({ accountId, accountName }),
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

  const onSubmit: SubmitHandler<AccountFormTypes> = async ({ accountName }) => {
    account?.id
      ? updateMutation.mutateAsync({ accountId: account?.id as string, accountName })
      : createMutation.mutateAsync({ userId: user?.id as string, accountName });
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
              {account?.id ? 'Update Account Name' : 'Create New Account'}
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
