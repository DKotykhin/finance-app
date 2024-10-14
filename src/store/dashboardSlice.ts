/* eslint-disable no-unused-vars */
import { create } from 'zustand';
import { RangeValue } from '@react-types/shared';
import { DateValue } from '@react-types/datepicker';

type DashboardState = {
  accountId: string;
  dateValue: RangeValue<DateValue>;
  setAccountId: (id: string) => void;
  setDateValue: (value: RangeValue<DateValue>) => void;
};

export const useDashboardStore = create<DashboardState>()((set) => ({
  accountId: '',
  dateValue: {
    start: null as unknown as DateValue,
    end: null as unknown as DateValue,
  },
  setAccountId: (accountId: string) => set(() => ({ accountId })),
  setDateValue: (dateValue: RangeValue<DateValue>) => set(() => ({ dateValue })),
}));
