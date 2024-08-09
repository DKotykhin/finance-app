'use client';

import React, { useCallback, useEffect, useState } from 'react';
import { Button, Card, CardBody, CardHeader, Select, SelectItem } from '@nextui-org/react';
import { RotateCcw, Save } from 'lucide-react';
import { toast } from 'react-toastify';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { SortOrder, UserSettings } from '@prisma/client';

import { getUserSettings } from '@/actions/UserSettings/getUserSettings';
import { upsertUserSettings } from '@/actions/UserSettings/upsertUserSettings';

import { rowsPerPageArray } from '../categories/const';
import { accountFieldArray, categoryFieldArray, sortOrderArray } from './const';

export const PagesSettings: React.FC<{ userId: string | null }> = ({ userId }) => {
  const [categorySettings, setCategorySettings] = useState({
    rowsPerPage: '',
    sortField: '',
    sortOrder: '',
  });
  const [accountSettings, setAccountSettings] = useState({
    rowsPerPage: '',
    sortField: '',
    sortOrder: '',
  });
  const [isSaveButtonDisabled, setIsSaveButtonDisabled] = useState(true);

  const queryClient = useQueryClient();

  const { data: userSettingsData, isLoading: isGetLoading } = useQuery({
    enabled: !!userId,
    queryKey: ['userSettings'],
    queryFn: () => getUserSettings({ userId: userId as string }),
  });

  const upsertMutation = useMutation({
    mutationFn: ({ userId, userSettingsData }: { userId: string; userSettingsData?: Partial<UserSettings> }) =>
      upsertUserSettings({ userId, userSettingsData }),
    onSuccess: () => {
      toast.success(`User Settings updated successfully`);
      queryClient.invalidateQueries({ queryKey: ['userSettings'] });
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });

  const initialSettings = useCallback(() => {
    setCategorySettings((prevState) => ({
      ...prevState,
      rowsPerPage: userSettingsData?.categoryRowsPerPage || '5',
      sortField: userSettingsData?.categorySortField || categoryFieldArray[0].key,
      sortOrder: userSettingsData?.categorySortOrder || sortOrderArray[0].key,
    }));
    setAccountSettings((prevState) => ({
      ...prevState,
      rowsPerPage: userSettingsData?.accountRowsPerPage || '5',
      sortField: userSettingsData?.accountSortField || accountFieldArray[0].key,
      sortOrder: userSettingsData?.accountSortOrder || sortOrderArray[0].key,
    }));
  }, [userSettingsData]);

  useEffect(() => {
      initialSettings();
  }, [initialSettings]);

  useEffect(() => {
    if (
      userSettingsData?.categoryRowsPerPage !== categorySettings.rowsPerPage ||
      userSettingsData?.categorySortField !== categorySettings.sortField ||
      userSettingsData?.categorySortOrder !== categorySettings.sortOrder ||
      userSettingsData?.accountRowsPerPage !== accountSettings.rowsPerPage ||
      userSettingsData?.accountSortField !== accountSettings.sortField ||
      userSettingsData?.accountSortOrder !== accountSettings.sortOrder
    ) {
      setIsSaveButtonDisabled(false);
    } else {
      setIsSaveButtonDisabled(true);
    }
  }, [
    accountSettings.rowsPerPage,
    accountSettings.sortField,
    accountSettings.sortOrder,
    categorySettings.rowsPerPage,
    categorySettings.sortField,
    categorySettings.sortOrder,
    userSettingsData,
  ]);

  const onSaveChanges = () => {
    upsertMutation.mutate({
      userId: userId as string,
      userSettingsData: {
        categoryRowsPerPage: categorySettings.rowsPerPage,
        categorySortField: categorySettings.sortField,
        categorySortOrder: categorySettings.sortOrder as SortOrder,
      },
    });
  };

  const onReset = () => {
    initialSettings();
  };

  return (
    <Card className="p-1 sm:p-4">
      <CardHeader>
        <p className="font-bold text-xl">Pages Settings</p>
      </CardHeader>
      <CardBody>
        <p className="mb-2">Category Page</p>
        <div className="flex flex-col lg:flex-row gap-4 w-full">
          <Select
            label="Select default rows per page"
            className="w-full sm:max-w-[240px]"
            selectedKeys={[categorySettings.rowsPerPage]}
            onChange={(e) =>
              setCategorySettings({
                ...categorySettings,
                rowsPerPage: e.target.value,
              })
            }
            isLoading={isGetLoading}
          >
            {rowsPerPageArray.map((row) => (
              <SelectItem key={row.key}>{row.label}</SelectItem>
            ))}
          </Select>
          <Select
            label="Select default sort field"
            className="w-full sm:max-w-[240px]"
            selectedKeys={[categorySettings.sortField]}
            onChange={(e) =>
              setCategorySettings({
                ...categorySettings,
                sortField: e.target.value,
              })
            }
            isLoading={isGetLoading}
          >
            {categoryFieldArray.map((row) => (
              <SelectItem key={row.key}>{row.label}</SelectItem>
            ))}
          </Select>
          <Select
            label="Select default sort order"
            className="w-full sm:max-w-[240px]"
            selectedKeys={[categorySettings.sortOrder]}
            onChange={(e) =>
              setCategorySettings({
                ...categorySettings,
                sortOrder: e.target.value as SortOrder,
              })
            }
            isLoading={isGetLoading}
          >
            {sortOrderArray.map((row) => (
              <SelectItem key={row.key}>{row.label}</SelectItem>
            ))}
          </Select>
        </div>

        <p className="mt-4 mb-2">Account Page</p>
        <div className="flex flex-col lg:flex-row gap-4 w-full">
          <Select
            label="Select default rows per page"
            className="w-full sm:max-w-[240px]"
            selectedKeys={[accountSettings.rowsPerPage]}
            onChange={(e) =>
              setAccountSettings({
                ...accountSettings,
                rowsPerPage: e.target.value,
              })
            }
            isLoading={isGetLoading}
          >
            {rowsPerPageArray.map((row) => (
              <SelectItem key={row.key}>{row.label}</SelectItem>
            ))}
          </Select>
          <Select
            label="Select default sort field"
            className="w-full sm:max-w-[240px]"
            selectedKeys={[accountSettings.sortField]}
            onChange={(e) =>
              setAccountSettings({
                ...accountSettings,
                sortField: e.target.value,
              })
            }
            isLoading={isGetLoading}
          >
            {accountFieldArray.map((row) => (
              <SelectItem key={row.key}>{row.label}</SelectItem>
            ))}
          </Select>
          <Select
            label="Select default sort order"
            className="w-full sm:max-w-[240px]"
            selectedKeys={[accountSettings.sortOrder]}
            onChange={(e) =>
              setAccountSettings({
                ...accountSettings,
                sortOrder: e.target.value as SortOrder,
              })
            }
            isLoading={isGetLoading}
          >
            {sortOrderArray.map((row) => (
              <SelectItem key={row.key}>{row.label}</SelectItem>
            ))}
          </Select>
        </div>
        <div className="mt-8 flex gap-4 justify-end">
          <Button
            color="default"
            className="w-full sm:w-auto self-end"
            onPress={onReset}
            isDisabled={upsertMutation.isPending || isSaveButtonDisabled}
          >
            <RotateCcw size={16} />
            Reset
          </Button>
          <Button
            color="secondary"
            className="w-full sm:w-auto self-end"
            onPress={onSaveChanges}
            isDisabled={upsertMutation.isPending || isSaveButtonDisabled}
          >
            <Save size={16} />
            Save Changes
          </Button>
        </div>
      </CardBody>
    </Card>
  );
};
