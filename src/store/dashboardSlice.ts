/* eslint-disable no-unused-vars */
import { create } from 'zustand';

type DashboardState = {
  accountId: string;
  date: {
    startDate?: Date;
    endDate?: Date;
  };
  setAccountId: (id: string) => void;
  setDates: (startDate: Date, endDate: Date) => void;
};

export const useDashboardStore = create<DashboardState>()((set) => ({
  accountId: '',
  date: {
    startDate: undefined,
    endDate: undefined,
  },
  setAccountId: (accountId: string) => set(() => ({ accountId })),
  setDates: (startDate: Date, endDate: Date) => set(() => ({ date: { startDate, endDate } })),
}));
