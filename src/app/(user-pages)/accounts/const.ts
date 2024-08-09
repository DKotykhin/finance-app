export const columns: { key: string; label: string; sortable?: boolean }[] = [
  {
    key: 'accountName',
    label: 'Account Name',
    sortable: true,
  },
  {
    key: 'balance',
    label: 'Balance',
    sortable: true,
  },
  {
    key: 'hideDecimal',
    label: 'Decimals',
    sortable: true,
  },
  {
    key: 'createdAt',
    label: 'Created',
    sortable: true,
  },
  {
    key: 'actions',
    label: 'Actions',
  },
];

export const rowsPerPageArray: { key: string; label: string }[] = [
  {
    key: '5',
    label: '5',
  },
  {
    key: '10',
    label: '10',
  },
  {
    key: '20',
    label: '20',
  },
];
