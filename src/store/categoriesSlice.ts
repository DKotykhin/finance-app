import { create } from 'zustand';

type CategoriesState = {
  rowsPerPage: string;
  setRowsPerPage: (row: string) => void;
};

export const useCategoriesStore = create<CategoriesState>()((set) => ({
  rowsPerPage: '',
  setRowsPerPage: (row: string) => set(() => ({ rowsPerPage: row })),
}));