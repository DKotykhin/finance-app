import { create } from 'zustand';

type AccountState = {
  accountId: string;
  // eslint-disable-next-line no-unused-vars
  setId: (id: string) => void;
};

export const useAccountStore = create<AccountState>()((set) => ({
  accountId: '',
  setId: (accountId: string) => set(() => ({ accountId })),
}));
