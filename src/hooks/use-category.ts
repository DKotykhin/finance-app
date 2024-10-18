import type { UseMutationResult } from '@tanstack/react-query';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'react-toastify';

import type { Category } from '@prisma/client';

import {
  bulkDeleteCategories,
  createCategory,
  deleteCategory,
  getCategories,
  updateCategory,
} from '@/actions/Category/_index';
import type { CategoryFormTypes } from '@/validation/categoryValidation';

export const useCategory = (
  userId?: string | null
): {
  categoryData?: Category[];
  isCategoryLoading: boolean;
  createCategory: UseMutationResult<Category, Error, CategoryFormTypes, unknown>;
  updateCategory: UseMutationResult<Category, Error, { categoryId: string; categoryData: CategoryFormTypes }, unknown>;
  deleteCategory: UseMutationResult<void, Error, string, unknown>;
  bulkDeleteCategories: UseMutationResult<void, Error, string[], unknown>;
} => {
  const { data, isLoading } = useQuery({
    enabled: !!userId,
    queryKey: ['categories'],
    queryFn: () => getCategories(),
  });

  const queryClient = useQueryClient();

  const createMutation = useMutation({
    mutationFn: (categoryData: CategoryFormTypes) => createCategory(categoryData),
    onSuccess: data => {
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

  const deleteMutation = useMutation({
    mutationFn: (id: string) => deleteCategory(id),
    onSuccess: () => {
      toast.success('Category deleted successfully');
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

  const bulkDeleteMutation = useMutation({
    mutationFn: (idList: string[]) => bulkDeleteCategories(idList),
    onSuccess: () => {
      toast.success('Categories deleted successfully');
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

  return {
    categoryData: data,
    isCategoryLoading: isLoading,
    createCategory: createMutation,
    updateCategory: updateMutation,
    deleteCategory: deleteMutation,
    bulkDeleteCategories: bulkDeleteMutation,
  };
};
