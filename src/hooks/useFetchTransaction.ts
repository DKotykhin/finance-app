import type { UseMutationResult, UseQueryResult } from '@tanstack/react-query';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'react-toastify';

import type { Account, Transaction } from '@prisma/client';
import type { DateValue } from '@internationalized/date';

import type { ExtendedTransaction, TransactionCreate } from '@/actions';
import {
  bulkDeleteTransactions,
  createTransaction,
  deleteTransaction,
  getTodaysTransactions,
  getTransactions,
  updateTransaction,
} from '@/actions';
import { valueToDate } from '@/utils';

export const useFetchTransaction = ({
  enabled = true,
  accountData,
  dateValue,
}: { enabled?: boolean; accountData?: Account[]; dateValue?: { start: DateValue; end: DateValue } } = {}): {
  transactions: UseQueryResult<ExtendedTransaction[], Error>;
  todaysTransactions: UseQueryResult<Transaction[], Error>;
  createTransaction: UseMutationResult<Transaction, Error, TransactionCreate, unknown>;
  updateTransaction: UseMutationResult<
    Transaction,
    Error,
    { transactionId: string; transactionData: TransactionCreate },
    unknown
  >;
  deleteTransaction: UseMutationResult<void, Error, string, unknown>;
  bulkDeleteTransactions: UseMutationResult<void, Error, string[], unknown>;
} => {
  const transactions = useQuery({
    enabled,
    queryKey: ['transactions', dateValue],
    queryFn: () =>
      getTransactions({
        accountIds: accountData?.map(account => account.id) ?? [],
        from: dateValue ? valueToDate(dateValue.start) : undefined,
        to: dateValue ? valueToDate(dateValue.end) : undefined,
      }),
  });

  const todaysTransactions = useQuery({
    enabled,
    queryKey: ['todaysTransactionsData'],
    queryFn: () => getTodaysTransactions({ accountIds: accountData?.map(account => account.id) ?? [] }),
  });

  const queryClient = useQueryClient();

  const createMutation = useMutation({
    mutationFn: (transactionData: TransactionCreate) => createTransaction(transactionData),
    onSuccess: () => {
      Promise.all([
        queryClient.invalidateQueries({
          queryKey: ['transactions'],
        }),
        queryClient.invalidateQueries({
          queryKey: ['transactionsWithStat'],
        }),
        queryClient.invalidateQueries({
          queryKey: ['previousTransactionsWithStat'],
        }),
        queryClient.invalidateQueries({
          queryKey: ['transactionsByCategory'],
        }),
        queryClient.invalidateQueries({
          queryKey: ['previousTransactionsByCategory'],
        }),
        queryClient.invalidateQueries({
          queryKey: ['todaysTransactionsData'],
        }),
      ]);
      toast.success(`Transaction created successfully`);
    },
    onError: error => {
      toast.error(error.message);
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ transactionId, transactionData }: { transactionId: string; transactionData: TransactionCreate }) =>
      updateTransaction({ transactionId, transactionData }),
    onSuccess: () => {
      toast.success(`Transaction updated successfully`);
      Promise.all([
        queryClient.invalidateQueries({
          queryKey: ['transactions'],
        }),
        queryClient.invalidateQueries({
          queryKey: ['transactionsWithStat'],
        }),
        queryClient.invalidateQueries({
          queryKey: ['previousTransactionsWithStat'],
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
    mutationFn: (id: string) => deleteTransaction(id),
    onSuccess: () => {
      toast.success('Transaction deleted successfully');
      Promise.all([
        queryClient.invalidateQueries({
          queryKey: ['transactions'],
        }),
        queryClient.invalidateQueries({
          queryKey: ['transactionsWithStat'],
        }),
        queryClient.invalidateQueries({
          queryKey: ['previousTransactionsWithStat'],
        }),
        queryClient.invalidateQueries({
          queryKey: ['transactionsByCategory'],
        }),
        queryClient.invalidateQueries({
          queryKey: ['previousTransactionsByCategory'],
        }),
        queryClient.invalidateQueries({
          queryKey: ['todaysTransactionsData'],
        }),
      ]);
    },
    onError: error => {
      toast.error(error.message);
    },
  });

  const bulkDeleteMutation = useMutation({
    mutationFn: (idList: string[]) => bulkDeleteTransactions(idList),
    onSuccess: () => {
      toast.success('Transactions deleted successfully');
      Promise.all([
        queryClient.invalidateQueries({
          queryKey: ['transactions'],
        }),
        queryClient.invalidateQueries({
          queryKey: ['transactionsWithStat'],
        }),
        queryClient.invalidateQueries({
          queryKey: ['previousTransactionsWithStat'],
        }),
        queryClient.invalidateQueries({
          queryKey: ['transactionsByCategory'],
        }),
        queryClient.invalidateQueries({
          queryKey: ['previousTransactionsByCategory'],
        }),
        queryClient.invalidateQueries({
          queryKey: ['todaysTransactionsData'],
        }),
      ]);
    },
    onError: error => {
      toast.error(error.message);
    },
  });

  return {
    transactions,
    todaysTransactions,
    createTransaction: createMutation,
    updateTransaction: updateMutation,
    deleteTransaction: deleteMutation,
    bulkDeleteTransactions: bulkDeleteMutation,
  };
};
