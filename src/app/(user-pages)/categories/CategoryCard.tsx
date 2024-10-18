'use client';

import React, { useEffect, useState } from 'react';

import dynamic from 'next/dynamic';

import { Button, Card, CardBody, CardHeader, Chip, Skeleton, useDisclosure } from '@nextui-org/react';
import { Plus, Trash2 } from 'lucide-react';

import { freeLimits } from '@/utils/_index';
import { SubscriptionModal } from '@/components/SubscriptionModal';
import { useConfirm, useCategory, useSettings, useSubscription } from '@/hooks';

import { CategoryModal } from './CategoryModal';

const CategoryList = dynamic(async () => (await import('./CategoryList')).CategoryList, { ssr: false });

export const CategoryCard: React.FC<{ userId: string | null }> = ({ userId }) => {
  const [idList, setIdList] = useState<string[]>([]);
  const [categoryListLength, setCategoryListLength] = useState(0);

  const { isOpen: isCategoryOpen, onOpen: onCategoryOpen, onOpenChange: onCategoryOpenChange } = useDisclosure();

  const {
    isOpen: isSubscriptionOpen,
    onOpen: onSubscriptionOpen,
    onOpenChange: onSubscriptionOpenChange,
  } = useDisclosure();

  const [ConfirmModal, confirm] = useConfirm({
    title: 'Delete Category',
    message:
      idList.length === 1
        ? 'Are you sure you want to delete this category?'
        : 'Are you sure you want to delete all these categories?',
  });

  const { subscriptionData } = useSubscription(userId);
  const { userSettingsData, isUserSettingsLoading } = useSettings(userId);
  const { categoryData, isCategoryLoading, bulkDeleteCategories } = useCategory(userId);

  useEffect(() => {
    if (bulkDeleteCategories.isSuccess) {
      setIdList([]);
    }
  }, [bulkDeleteCategories.isSuccess]);

  const onDelete = async () => {
    const ok = await confirm();

    if (ok) {
      bulkDeleteCategories.mutateAsync(idList);
    }
  };

  return (
    <>
      <Card className="-mt-24 mb-12 p-1 sm:p-4">
        <CardHeader className="flex flex-col sm:flex-row gap-4 justify-between items-start sm:items-center">
          {isCategoryLoading ? (
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
                    isDisabled={bulkDeleteCategories.isPending}
                    className="w-full sm:w-auto"
                  >
                    <Trash2 size={16} />
                    Delete ({idList.length})
                  </Button>
                )}
                <Button
                  color="secondary"
                  onPress={
                    !subscriptionData && (categoryData?.length ?? 0) >= freeLimits.categories
                      ? onSubscriptionOpen
                      : onCategoryOpen
                  }
                  className="w-full sm:w-auto"
                >
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
            isCategoryDataLoading={isCategoryLoading}
            userSettingsData={userSettingsData}
            isUserSettingsLoading={isUserSettingsLoading}
            selectedKeysFn={setIdList}
            categoryListLengthFn={setCategoryListLength}
          />
        </CardBody>
      </Card>
      <CategoryModal isOpen={isCategoryOpen} onOpenChange={onCategoryOpenChange} />
      <SubscriptionModal
        isOpen={isSubscriptionOpen}
        onOpenChange={onSubscriptionOpenChange}
        userId={userId}
        title={`You can't create more than ${freeLimits.categories} categories on FREE plan`}
      />
      <ConfirmModal />
    </>
  );
};
