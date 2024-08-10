'use client';

import React, { useState } from 'react';
import { Button, Card, CardBody, CardHeader, Chip, Skeleton, useDisclosure } from '@nextui-org/react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Plus, Trash2 } from 'lucide-react';
import { toast } from 'react-toastify';
import dynamic from 'next/dynamic';

import { bulkDeleteCategories, getCategories } from '@/actions/Category/_index';
import { getUserSettings } from '@/actions/UserSettings/getUserSettings';
import { useConfirm } from '@/hooks/use-confirm';

import { CategoryModal } from './CategoryModal';
const CategoryList = dynamic(async () => (await import('./CategoryList')).CategoryList, { ssr: false });

export const CategoryCard: React.FC<{ userId: string | null }> = ({ userId }) => {
  const [idList, setIdList] = useState<string[]>([]);
  const { isOpen, onOpen, onOpenChange } = useDisclosure();
  const [categoryListLength, setCategoryListLength] = useState(0);

  const queryClient = useQueryClient();

  const [ConfirmModal, confirm] = useConfirm({
    title: 'Delete Category',
    message:
      idList.length === 1
        ? 'Are you sure you want to delete this category?'
        : 'Are you sure you want to delete all these categories?',
  });

  const { data: categoryData, isLoading: isCategoryDataLoading } = useQuery({
    enabled: !!userId,
    queryKey: ['categories'],
    queryFn: () => getCategories({ userId: userId as string }),
  });

  const { data: userSettingsData, isLoading: isUserSettingsLoading } = useQuery({
    enabled: !!userId,
    queryKey: ['userSettings'],
    queryFn: () => getUserSettings({ userId: userId as string }),
  });

  const bulkDeleteMutation = useMutation({
    mutationFn: (idList: string[]) => bulkDeleteCategories(idList),
    onSuccess: () => {
      setIdList([]);
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
    onError: (error) => {
      toast.error(error.message);
    },
  });

  const onDelete = async () => {
    const ok = await confirm();
    if (ok) {
      bulkDeleteMutation.mutateAsync(idList);
    }
  };

  return (
    <>
      <Card className="-mt-24 mb-12 p-1 sm:p-4">
        <CardHeader className="flex flex-col sm:flex-row gap-4 justify-between items-start sm:items-center">
          {isCategoryDataLoading ? (
            <>
              <Skeleton className="w-[200px] h-10 rounded-lg bg-slate-100"></Skeleton>
              <Skeleton className="w-[200px] h-10 rounded-lg bg-slate-100"></Skeleton>
            </>
          ) : (
            <>
              <div className="flex items-center gap-4">
                <p className="font-bold text-xl">Category page</p>
                {categoryListLength > 0 && (
                  <Chip radius="md" color="secondary">
                    {categoryListLength}
                  </Chip>
                )}
              </div>
              <div className="flex gap-4 w-full sm:w-auto">
                {idList.length > 0 && (
                  <Button
                    color="warning"
                    variant="bordered"
                    onPress={onDelete}
                    isDisabled={bulkDeleteMutation.isPending}
                    className="w-full sm:w-auto"
                  >
                    <Trash2 size={16} />
                    Delete ({idList.length})
                  </Button>
                )}
                <Button color="secondary" onPress={onOpen} className="w-full sm:w-auto">
                  <Plus size={16} />
                  Add New
                </Button>
              </div>
            </>
          )}
        </CardHeader>
        <CardBody>
          <CategoryList
            categoryData={categoryData}
            isCategoryDataLoading={isCategoryDataLoading}
            userSettingsData={userSettingsData}
            isUserSettingsLoading={isUserSettingsLoading}
            selectedKeysFn={setIdList}
            categoryListLengthFn={setCategoryListLength}
          />
        </CardBody>
      </Card>
      <CategoryModal isOpen={isOpen} onOpenChange={onOpenChange} />
      <ConfirmModal />
    </>
  );
};
