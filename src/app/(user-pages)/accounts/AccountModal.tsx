'use client';

import React from 'react';
import {
  Button,
  Input,
  Modal,
  ModalBody,
  ModalContent,
  ModalFooter,
  ModalHeader,
  useDisclosure,
} from '@nextui-org/react';
import { Controller, Mode, Resolver, SubmitHandler, useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { toast } from 'react-toastify';
import { Plus } from 'lucide-react';
import { useUser } from '@clerk/nextjs';
import { useMutation, useQueryClient } from '@tanstack/react-query';

import { AccountFormTypes, accountFormValidationSchema } from '@/validation/accountValidation';
import { createAccount } from '@/actions/Account/_index';

interface AccountFormValidationTypes {
  defaultValues: AccountFormTypes;
  resolver: Resolver<any>;
  mode: Mode;
}

const AccountFormValidation: AccountFormValidationTypes = {
  defaultValues: {
    accountName: '',
  },
  resolver: zodResolver(accountFormValidationSchema),
  mode: 'onBlur',
};

export const AccountModal: React.FC = () => {
  const { isOpen, onOpen, onOpenChange } = useDisclosure();

  const { user } = useUser();
  const queryClient = useQueryClient();

  const createMutation = useMutation({
    mutationFn: ({ userId, accountName }: any) => createAccount({ userId, accountName }),
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

  const {
    control,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<AccountFormTypes>(AccountFormValidation);

  const onSubmit: SubmitHandler<AccountFormTypes> = async ({ accountName }) => {
    await createMutation.mutateAsync({ userId: user?.id, accountName });
  };

  return (
    <>
      <Button
        color="secondary"
        onPress={() => {
          onOpen(), reset();
        }}
        className="w-full sm:w-auto"
      >
        <Plus size={16} />
        Add New
      </Button>
      <Modal isOpen={isOpen} onOpenChange={onOpenChange} isDismissable={false}>
        <ModalContent>
          {(onClose) => (
            <>
              <ModalHeader className="flex justify-center">Create New Account</ModalHeader>
              <form className="w-full" onSubmit={handleSubmit(onSubmit)}>
                <ModalBody>
                  <Controller
                    name="accountName"
                    control={control}
                    render={({ field }) => (
                      <Input
                        {...field}
                        isRequired
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
                  <Button type="submit" color="primary" isDisabled={createMutation.isPending}>
                    Create
                  </Button>
                </ModalFooter>
              </form>
            </>
          )}
        </ModalContent>
      </Modal>
    </>
  );
};
