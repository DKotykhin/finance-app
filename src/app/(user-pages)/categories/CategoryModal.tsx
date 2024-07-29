'use client';

import React, { useEffect } from 'react';
import { Button, Checkbox, Input, Modal, ModalBody, ModalContent, ModalFooter, ModalHeader } from '@nextui-org/react';
import { Controller, Mode, Resolver, SubmitHandler, useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { toast } from 'react-toastify';
import { useUser } from '@clerk/nextjs';
import { useMutation, useQueryClient } from '@tanstack/react-query';

import { CategoryFormTypes, categoryFormValidationSchema } from '@/validation/categoryValidation';
import { createCategory, updateCategory } from '@/actions/Category/_index';

import { CategoryUpdate } from './CategoryList';

interface CategoryFormValidationTypes {
  defaultValues: CategoryFormTypes;
  resolver: Resolver<any>;
  mode: Mode;
}

interface CategoryModalProps {
  isOpen: boolean;
  onOpenChange: () => void;
  category?: CategoryUpdate | null;
}

const CategoryFormValidation: CategoryFormValidationTypes = {
  defaultValues: {
    name: '',
    visible: false,
  },
  resolver: zodResolver(categoryFormValidationSchema),
  mode: 'onSubmit',
};

export const CategoryModal: React.FC<CategoryModalProps> = ({ isOpen, onOpenChange, category }) => {
  const { user } = useUser();
  const queryClient = useQueryClient();

  useEffect(() => {
    reset({
      name: category?.name || '',
      visible: category?.visible || false,
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [category?.name, category?.visible]);

  const createMutation = useMutation({
    mutationFn: ({ userId, categoryData }: { userId: string; categoryData: CategoryFormTypes }) =>
      createCategory({ userId, categoryData }),
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
      queryClient.invalidateQueries({ queryKey: ['categories'] });
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
    if (category?.name === categoryData.name && category?.visible === categoryData.visible) {
      toast.info('No changes detected');
      return;
    }
    category?.id
      ? updateMutation.mutateAsync({ categoryId: category?.id as string, categoryData })
      : createMutation.mutateAsync({ userId: user?.id as string, categoryData: { ...categoryData, visible: true } });
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
                  <Controller
                    name="visible"
                    control={control}
                    defaultValue={false}
                    render={({ field }) => (
                      <Checkbox
                        {...field}
                        value={field?.value?.toString()}
                        defaultSelected={category?.visible || false}
                      >
                        Visible
                      </Checkbox>
                    )}
                  />
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
