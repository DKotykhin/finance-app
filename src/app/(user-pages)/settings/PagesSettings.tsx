'use client';

import React, { useCallback, useEffect, useMemo, useState } from 'react';

import { Button, Select, SelectItem } from '@nextui-org/react';
import { RotateCcw, Save } from 'lucide-react';
import type { SortOrder } from '@prisma/client';
import { CategoriesCharts, TransactionCharts } from '@prisma/client';

import { rowsPerPageArray } from '@/utils';
import { useFetchSettings } from '@/hooks';

import { accountFieldArray, categoryFieldArray, periodArray, sortOrderArray, transactionFieldArray } from './const';

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

  const [transactionSettings, setTransactionSettings] = useState({
    rowsPerPage: '',
    period: 30,
    sortField: '',
    sortOrder: '',
  });

  const [dashboardSettings, setDashboardSettings] = useState({
    period: 30,
    transactionsView: '',
    categoriesView: '',
  });

  const { userSettings, upsertUserSettings } = useFetchSettings(!!userId);

  const initialSettings = useCallback(() => {
    setCategorySettings(prevState => ({
      ...prevState,
      rowsPerPage: userSettings.data?.categoryRowsPerPage || '5',
      sortField: userSettings.data?.categorySortField || categoryFieldArray[0].key,
      sortOrder: userSettings.data?.categorySortOrder || sortOrderArray[0].key,
    }));
    setAccountSettings(prevState => ({
      ...prevState,
      rowsPerPage: userSettings.data?.accountRowsPerPage || '5',
      sortField: userSettings.data?.accountSortField || accountFieldArray[0].key,
      sortOrder: userSettings.data?.accountSortOrder || sortOrderArray[0].key,
    }));
    setTransactionSettings(prevState => ({
      ...prevState,
      rowsPerPage: userSettings.data?.transactionRowsPerPage || '5',
      period: userSettings.data?.transactionPeriod || 30,
      sortField: userSettings.data?.transactionSortField || transactionFieldArray[0].key,
      sortOrder: userSettings.data?.transactionSortOrder || sortOrderArray[0].key,
    }));
    setDashboardSettings(prevState => ({
      ...prevState,
      period: userSettings.data?.dashboardPeriod || 30,
      transactionsView: userSettings.data?.dashboardTransactionsChart || TransactionCharts.BarChart,
      categoriesView: userSettings.data?.dashboardCategoriesChart || CategoriesCharts.PieChart,
    }));
  }, [userSettings.data]);

  useEffect(() => {
    initialSettings();
  }, [initialSettings]);

  const isSaveButtonDisabled = useMemo(() => {
    return (
      userSettings.data?.categoryRowsPerPage === categorySettings.rowsPerPage &&
      userSettings.data?.categorySortField === categorySettings.sortField &&
      userSettings.data?.categorySortOrder === categorySettings.sortOrder &&
      userSettings.data?.accountRowsPerPage === accountSettings.rowsPerPage &&
      userSettings.data?.accountSortField === accountSettings.sortField &&
      userSettings.data?.accountSortOrder === accountSettings.sortOrder &&
      userSettings.data?.transactionRowsPerPage === transactionSettings.rowsPerPage &&
      userSettings.data?.transactionPeriod === transactionSettings.period &&
      userSettings.data?.transactionSortField === transactionSettings.sortField &&
      userSettings.data?.transactionSortOrder === transactionSettings.sortOrder &&
      userSettings.data?.dashboardPeriod === dashboardSettings.period &&
      userSettings.data?.dashboardTransactionsChart === dashboardSettings.transactionsView &&
      userSettings.data?.dashboardCategoriesChart === dashboardSettings.categoriesView
    );
  }, [
    accountSettings.rowsPerPage,
    accountSettings.sortField,
    accountSettings.sortOrder,
    categorySettings.rowsPerPage,
    categorySettings.sortField,
    categorySettings.sortOrder,
    transactionSettings.rowsPerPage,
    transactionSettings.period,
    transactionSettings.sortField,
    transactionSettings.sortOrder,
    dashboardSettings.period,
    dashboardSettings.transactionsView,
    dashboardSettings.categoriesView,
    userSettings.data,
  ]);

  const onSaveChanges = () => {
    upsertUserSettings.mutate({
      categoryRowsPerPage: categorySettings.rowsPerPage,
      categorySortField: categorySettings.sortField,
      categorySortOrder: categorySettings.sortOrder as SortOrder,
      accountRowsPerPage: accountSettings.rowsPerPage,
      accountSortField: accountSettings.sortField,
      accountSortOrder: accountSettings.sortOrder as SortOrder,
      transactionRowsPerPage: transactionSettings.rowsPerPage,
      transactionPeriod: transactionSettings.period,
      transactionSortField: transactionSettings.sortField,
      transactionSortOrder: transactionSettings.sortOrder as SortOrder,
      dashboardPeriod: dashboardSettings.period,
      dashboardTransactionsChart: dashboardSettings.transactionsView as TransactionCharts,
      dashboardCategoriesChart: dashboardSettings.categoriesView as CategoriesCharts,
    });
  };

  return (
    <>
      <div className="border p-3 sm:p-4 rounded-lg">
        <p className="mb-2 font-semibold">Dashboard</p>
        <div className="flex flex-col md:flex-row gap-4 w-full">
          <Select
            label="Select default period"
            className="w-full sm:max-w-[240px]"
            selectedKeys={[dashboardSettings.period.toString()]}
            onChange={e =>
              setDashboardSettings({
                ...dashboardSettings,
                period: +e.target.value,
              })
            }
            isLoading={userSettings.isLoading}
          >
            {periodArray.map(value => (
              <SelectItem key={value}>{value.toString()}</SelectItem>
            ))}
          </Select>
          <div className="w-full flex flex-col gap-4 sm:flex-row">
            <Select
              label="Select default transactions view"
              className="w-full sm:max-w-[240px]"
              selectedKeys={[dashboardSettings.transactionsView]}
              onChange={e =>
                setDashboardSettings({
                  ...dashboardSettings,
                  transactionsView: e.target.value,
                })
              }
              isLoading={userSettings.isLoading}
            >
              {Object.values(TransactionCharts).map(row => (
                <SelectItem key={row}>{row}</SelectItem>
              ))}
            </Select>
            <Select
              label="Select default categories view"
              className="w-full sm:max-w-[240px]"
              selectedKeys={[dashboardSettings.categoriesView]}
              onChange={e =>
                setDashboardSettings({
                  ...dashboardSettings,
                  categoriesView: e.target.value,
                })
              }
              isLoading={userSettings.isLoading}
            >
              {Object.values(CategoriesCharts).map(row => (
                <SelectItem key={row}>{row}</SelectItem>
              ))}
            </Select>
          </div>
        </div>
      </div>
      <div className="border p-3 sm:p-4 rounded-lg mt-4">
        <p className="mb-2 font-semibold">Transactions</p>
        <div className="w-full flex flex-col gap-4 sm:flex-row mb-4">
          <Select
            label="Select default period"
            className="w-full sm:max-w-[240px]"
            selectedKeys={[transactionSettings.period.toString()]}
            onChange={e =>
              setTransactionSettings({
                ...transactionSettings,
                period: +e.target.value,
              })
            }
            isLoading={userSettings.isLoading}
          >
            {periodArray.map(value => (
              <SelectItem key={value}>{value.toString()}</SelectItem>
            ))}
          </Select>
          <Select
            label="Select default sort field"
            className="w-full sm:max-w-[240px]"
            selectedKeys={[transactionSettings.sortField]}
            onChange={e =>
              setTransactionSettings({
                ...transactionSettings,
                sortField: e.target.value,
              })
            }
            isLoading={userSettings.isLoading}
          >
            {transactionFieldArray.map(row => (
              <SelectItem key={row.key}>{row.label}</SelectItem>
            ))}
          </Select>
        </div>
        <div className="w-full flex flex-col gap-4 sm:flex-row">
          <Select
            label="Select default rows per page"
            className="w-full sm:max-w-[240px]"
            selectedKeys={[transactionSettings.rowsPerPage]}
            onChange={e =>
              setTransactionSettings({
                ...transactionSettings,
                rowsPerPage: e.target.value,
              })
            }
            isLoading={userSettings.isLoading}
          >
            {rowsPerPageArray.map(row => (
              <SelectItem key={row.key}>{row.label}</SelectItem>
            ))}
          </Select>

          <Select
            label="Select default sort order"
            className="w-full sm:max-w-[240px]"
            selectedKeys={[transactionSettings.sortOrder]}
            onChange={e =>
              setTransactionSettings({
                ...transactionSettings,
                sortOrder: e.target.value as SortOrder,
              })
            }
            isLoading={userSettings.isLoading}
          >
            {sortOrderArray.map(row => (
              <SelectItem key={row.key}>{row.label}</SelectItem>
            ))}
          </Select>
        </div>
      </div>

      <div className="border p-3 sm:p-4 rounded-lg mt-4">
        <p className="mb-2 font-semibold">Accounts</p>
        <div className="flex flex-col md:flex-row gap-4 w-full">
          <Select
            label="Select default rows per page"
            className="w-full sm:max-w-[240px]"
            selectedKeys={[accountSettings.rowsPerPage]}
            onChange={e =>
              setAccountSettings({
                ...accountSettings,
                rowsPerPage: e.target.value,
              })
            }
            isLoading={userSettings.isLoading}
          >
            {rowsPerPageArray.map(row => (
              <SelectItem key={row.key}>{row.label}</SelectItem>
            ))}
          </Select>
          <div className="w-full flex flex-col gap-4 sm:flex-row">
            <Select
              label="Select default sort field"
              className="w-full sm:max-w-[240px]"
              selectedKeys={[accountSettings.sortField]}
              onChange={e =>
                setAccountSettings({
                  ...accountSettings,
                  sortField: e.target.value,
                })
              }
              isLoading={userSettings.isLoading}
            >
              {accountFieldArray.map(row => (
                <SelectItem key={row.key}>{row.label}</SelectItem>
              ))}
            </Select>
            <Select
              label="Select default sort order"
              className="w-full sm:max-w-[240px]"
              selectedKeys={[accountSettings.sortOrder]}
              onChange={e =>
                setAccountSettings({
                  ...accountSettings,
                  sortOrder: e.target.value as SortOrder,
                })
              }
              isLoading={userSettings.isLoading}
            >
              {sortOrderArray.map(row => (
                <SelectItem key={row.key}>{row.label}</SelectItem>
              ))}
            </Select>
          </div>
        </div>
      </div>

      <div className="border p-3 sm:p-4 rounded-lg mt-4">
        <p className="mb-2 font-semibold">Categories</p>
        <div className="flex flex-col md:flex-row gap-4 w-full">
          <Select
            label="Select default rows per page"
            className="w-full sm:max-w-[240px]"
            selectedKeys={[categorySettings.rowsPerPage]}
            onChange={e =>
              setCategorySettings({
                ...categorySettings,
                rowsPerPage: e.target.value,
              })
            }
            isLoading={userSettings.isLoading}
          >
            {rowsPerPageArray.map(row => (
              <SelectItem key={row.key}>{row.label}</SelectItem>
            ))}
          </Select>
          <div className="w-full flex flex-col gap-4 sm:flex-row">
            <Select
              label="Select default sort field"
              className="w-full sm:max-w-[240px]"
              selectedKeys={[categorySettings.sortField]}
              onChange={e =>
                setCategorySettings({
                  ...categorySettings,
                  sortField: e.target.value,
                })
              }
              isLoading={userSettings.isLoading}
            >
              {categoryFieldArray.map(row => (
                <SelectItem key={row.key}>{row.label}</SelectItem>
              ))}
            </Select>
            <Select
              label="Select default sort order"
              className="w-full sm:max-w-[240px]"
              selectedKeys={[categorySettings.sortOrder]}
              onChange={e =>
                setCategorySettings({
                  ...categorySettings,
                  sortOrder: e.target.value as SortOrder,
                })
              }
              isLoading={userSettings.isLoading}
            >
              {sortOrderArray.map(row => (
                <SelectItem key={row.key}>{row.label}</SelectItem>
              ))}
            </Select>
          </div>
        </div>
      </div>

      <div className="mt-8 flex gap-4 justify-end">
        <Button
          color="default"
          className="w-full sm:w-auto self-end"
          onPress={initialSettings}
          isDisabled={upsertUserSettings.isPending || isSaveButtonDisabled}
        >
          <RotateCcw size={16} />
          Reset
        </Button>
        <Button
          color="secondary"
          className="w-full sm:w-auto self-end"
          onPress={onSaveChanges}
          isDisabled={isSaveButtonDisabled}
          isLoading={upsertUserSettings.isPending}
        >
          <Save size={16} />
          Save Changes
        </Button>
      </div>
    </>
  );
};
