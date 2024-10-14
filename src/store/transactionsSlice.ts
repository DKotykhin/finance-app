/* eslint-disable no-unused-vars */
import { create } from 'zustand';
import { Selection } from '@nextui-org/react';
import { DateValue } from '@internationalized/date';

type TransactionsState = {
  accountValue: Selection;
  categoryValue: Selection;
  dateValue: {
    start: DateValue;
    end: DateValue;
  }
  setAccountValue: (value: Selection) => void;
  setCategoryValue: (value: Selection) => void;
  setDateValue: (value: { start: DateValue; end: DateValue }) => void;
};

export const useTransactionsStore = create<TransactionsState>()((set) => ({
  accountValue: new Set(['all']),
  categoryValue: new Set(['all']),
  dateValue: {
    start: null as unknown as DateValue,
    end: null as unknown as DateValue,
  },
  setAccountValue: (value: Selection) => set(() => ({ accountValue: value })),
  setCategoryValue: (value: Selection) => set(() => ({ categoryValue: value })),
  setDateValue: (dateValue: { start: DateValue; end: DateValue }) => set(() => ({ dateValue })),
}));
