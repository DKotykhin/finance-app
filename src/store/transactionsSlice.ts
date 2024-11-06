import { create } from 'zustand';
import type { Selection } from '@nextui-org/react';

type TransactionsState = {
  accountValue: Selection;
  categoryValue: Selection;
  startDate?: Date;
  endDate?: Date;
  rowsPerPage: string;
  setAccountValue: (value: Selection) => void;
  setCategoryValue: (value: Selection) => void;
  setStartDate: (date: Date) => void;
  setEndDate: (date: Date) => void;
  setRowsPerPage: (row: string) => void;
};

export const useTransactionsStore = create<TransactionsState>()((set) => ({
  accountValue: new Set(['all']),
  categoryValue: new Set(['all']),
  startDate: undefined,
  endDate: undefined,
  rowsPerPage: '',
  setAccountValue: (value: Selection) => set(() => ({ accountValue: value })),
  setCategoryValue: (value: Selection) => set(() => ({ categoryValue: value })),
  setStartDate: (startDate: Date) => set(() => ({ startDate })),
  setEndDate: (endDate: Date) => set(() => ({ endDate })),
  setRowsPerPage: (row: string) => set(() => ({ rowsPerPage: row })),
}));
