import type { UseMutationResult } from '@tanstack/react-query';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'react-toastify';

import type { Account } from '@prisma/client';

import type { AccountFormTypes } from '@/validation/accountValidation';
import type { ExtendedAccount } from '@/actions/Account/_index';
import { bulkDeleteAccounts, createAccount, deleteAccount, getAccounts, updateAccount } from '@/actions/Account/_index';

export const useAccount = (
  userId?: string | null
): {
  accountData?: ExtendedAccount[];
  isAccountLoading: boolean;
  createAccount: UseMutationResult<Account, Error, AccountFormTypes, unknown>;
  updateAccount: UseMutationResult<Account, Error, { accountId: string; accountData: AccountFormTypes }, unknown>;
  deleteAccount: UseMutationResult<void, Error, string, unknown>;
  bulkDeleteAccounts: UseMutationResult<void, Error, string[], unknown>;
} => {
  const { data, isLoading } = useQuery({
    enabled: !!userId,
    queryKey: ['accounts'],
    queryFn: () => getAccounts(),
  });

  const queryClient = useQueryClient();

  const createMutation = useMutation({
    mutationFn: (accountData: AccountFormTypes) => createAccount(accountData),
    onSuccess: data => {
      toast.success(`Account ${data.accountName} created successfully`);
      queryClient.invalidateQueries({ queryKey: ['accounts'] });
    },
    onError: error => {
      toast.error(error.message);
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ accountId, accountData }: { accountId: string; accountData: AccountFormTypes }) =>
      updateAccount({ accountId, accountData }),
    onSuccess: data => {
      toast.success(`Account ${data.accountName} updated successfully`);
      Promise.all([
        queryClient.invalidateQueries({ queryKey: ['accounts'] }),
        queryClient.invalidateQueries({
          queryKey: ['transactions'],
        }),
        queryClient.invalidateQueries({
          queryKey: ['transactionsWithStat'],
        }),
        queryClient.invalidateQueries({
          queryKey: ['previousTransactionsWithStat'],
        }),
      ]);
    },
    onError: error => {
      toast.error(error.message);
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => deleteAccount(id),
    onSuccess: () => {
      toast.success('Account deleted successfully');
      queryClient.invalidateQueries({ queryKey: ['accounts'] });
    },
    onError: error => {
      toast.error(error.message);
    },
  });

  const bulkDeleteMutation = useMutation({
    mutationFn: (idList: string[]) => bulkDeleteAccounts(idList),
    onSuccess: () => {
      toast.success('Accounts deleted successfully');
      queryClient.invalidateQueries({ queryKey: ['accounts'] });
    },
    onError: error => {
      toast.error(error.message);
    },
  });

  return {
    accountData: data,
    isAccountLoading: isLoading,
    createAccount: createMutation,
    updateAccount: updateMutation,
    deleteAccount: deleteMutation,
    bulkDeleteAccounts: bulkDeleteMutation,
  };
};
