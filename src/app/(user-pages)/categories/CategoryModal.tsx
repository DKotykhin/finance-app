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
import type { Mode, Resolver, SubmitHandler} from 'react-hook-form';
import { Controller, useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { toast } from 'react-toastify';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Info } from 'lucide-react';

import type { CategoryFormTypes} from '@/validation/categoryValidation';
import { categoryFormValidationSchema } from '@/validation/categoryValidation';
import { createCategory, updateCategory } from '@/actions/Category/_index';

import type { CategoryUpdate } from './CategoryList';

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
    categoryName: '',
    hidden: false,
  },
  resolver: zodResolver(categoryFormValidationSchema),
  mode: 'onSubmit',
};

export const CategoryModal: React.FC<CategoryModalProps> = ({ isOpen, onOpenChange, category }) => {
  const queryClient = useQueryClient();

  useEffect(() => {
    reset({
      categoryName: category?.categoryName || '',
      hidden: category?.hidden || false,
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [category?.categoryName, category?.hidden]);

  const createMutation = useMutation({
    mutationFn: ({ categoryData }: { categoryData: CategoryFormTypes }) => createCategory({ categoryData }),
    onSuccess: data => {
      reset();
      onOpenChange();
      toast.success(`Category ${data.categoryName} created successfully`);
      queryClient.invalidateQueries({ queryKey: ['categories'] });
    },
    onError: error => {
      toast.error(error.message);
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ categoryId, categoryData }: { categoryId: string; categoryData: CategoryFormTypes }) =>
      updateCategory({ categoryId, categoryData }),
    onSuccess: data => {
      reset();
      onOpenChange();
      toast.success(`Category ${data.categoryName} updated successfully`);
      Promise.all([
        queryClient.invalidateQueries({
          queryKey: ['categories'],
        }),
        queryClient.invalidateQueries({
          queryKey: ['transactionsByCategory'],
        }),
        queryClient.invalidateQueries({
          queryKey: ['previousTransactionsByCategory'],
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
  } = useForm<CategoryFormTypes>(CategoryFormValidation);

  const onSubmit: SubmitHandler<CategoryFormTypes> = async categoryData => {
    if (category?.categoryName === categoryData.categoryName && category?.hidden === categoryData.hidden) {
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
        {onClose => (
          <>
            <ModalHeader className="flex justify-center">
              {category?.id ? 'Update Category' : 'Create New Category'}
            </ModalHeader>
            <form className="w-full" onSubmit={handleSubmit(onSubmit)}>
              <ModalBody>
                <Controller
                  name="categoryName"
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
                      isInvalid={!!errors.categoryName}
                      errorMessage={errors.categoryName?.message}
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
