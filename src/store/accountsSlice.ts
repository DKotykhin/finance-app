import { create } from 'zustand';

type AccountsState = {
  rowsPerPage: string;
  setRowsPerPage: (row: string) => void;
};

export const useAccountsStore = create<AccountsState>()((set) => ({
  rowsPerPage: '',
  setRowsPerPage: (row: string) => set(() => ({ rowsPerPage: row })),
}));