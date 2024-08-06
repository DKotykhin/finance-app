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
  Tooltip,
} from '@nextui-org/react';
import { Controller, Mode, Resolver, SubmitHandler, useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { toast } from 'react-toastify';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Info } from 'lucide-react';

import { CategoryFormTypes, categoryFormValidationSchema } from '@/validation/categoryValidation';
import { createCategory, updateCategory } from '@/actions/Category/_index';

import { CategoryUpdate } from './CategoryList';

interface CategoryModalProps {
  isOpen: boolean;
  onOpenChange: () => void;
  category?: CategoryUpdate | null;
}

interface CategoryFormValidationTypes {
  defaultValues: CategoryFormTypes;
  resolver: Resolver<any>;
  mode: Mode;
}

const CategoryFormValidation: CategoryFormValidationTypes = {
  defaultValues: {
    name: '',
    hidden: false,
  },
  resolver: zodResolver(categoryFormValidationSchema),
  mode: 'onSubmit',
};

export const CategoryModal: React.FC<CategoryModalProps> = ({ isOpen, onOpenChange, category }) => {
  const queryClient = useQueryClient();

  useEffect(() => {
    reset({
      name: category?.name || '',
      hidden: category?.hidden || false,
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [category?.name, category?.hidden]);

  const createMutation = useMutation({
    mutationFn: ({ categoryData }: { categoryData: CategoryFormTypes }) => createCategory({ categoryData }),
    onSuccess: (data) => {
      reset();
      onOpenChange();
      toast.success(`Category ${data.name} created successfully`);
      queryClient.invalidateQueries({ queryKey: ['categories'] });
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ categoryId, categoryData }: { categoryId: string; categoryData: CategoryFormTypes }) =>
      updateCategory({ categoryId, categoryData }),
    onSuccess: (data) => {
      reset();
      onOpenChange();
      toast.success(`Category ${data.name} updated successfully`);
      queryClient.invalidateQueries({
        queryKey: ['categories', 'transactionsByCategory', 'previousTransactionsByCategory'],
      });
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
  } = useForm<CategoryFormTypes>(CategoryFormValidation);

  const onSubmit: SubmitHandler<CategoryFormTypes> = async (categoryData) => {
    if (category?.name === categoryData.name && category?.hidden === categoryData.hidden) {
      toast.info('No changes detected');
      return;
    }
    category?.id
      ? updateMutation.mutateAsync({ categoryId: category?.id as string, categoryData })
      : createMutation.mutateAsync({ categoryData });
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
              {category?.id ? 'Update Category' : 'Create New Category'}
            </ModalHeader>
            <form className="w-full" onSubmit={handleSubmit(onSubmit)}>
              <ModalBody>
                <Controller
                  name="name"
                  control={control}
                  render={({ field }) => (
                    <Input
                      {...field}
                      isRequired
                      autoFocus
                      type="text"
                      label="Category name"
                      labelPlacement="outside"
                      placeholder="Enter category name"
                      description="e.g. Food, Travel, Clothing"
                      isInvalid={!!errors.name}
                      errorMessage={errors.name?.message}
                    />
                  )}
                />
                {category?.id && (
                  <div className="flex gap-2 items-center">
                    <Controller
                      name="hidden"
                      control={control}
                      defaultValue={false}
                      render={({ field }) => (
                        <Checkbox
                          {...field}
                          value={field?.value?.toString()}
                          defaultSelected={category?.hidden || false}
                        >
                          Hidden
                        </Checkbox>
                      )}
                    />
                    <Tooltip
                      content="Hidden categories are not available for new transactions"
                      color="primary"
                      className="max-w-[200px]"
                    >
                      <Info size={16} color="#2563eb" />
                    </Tooltip>
                  </div>
                )}
              </ModalBody>
              <ModalFooter>
                <Button type="button" color="default" variant="light" onPress={onClose}>
                  Cancel
                </Button>
                <Button type="submit" color="primary" isDisabled={createMutation.isPending || updateMutation.isPending}>
                  {category?.id ? 'Update' : 'Create'}
                </Button>
              </ModalFooter>
            </form>
          </>
        )}
      </ModalContent>
    </Modal>
  );
};
