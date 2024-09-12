'use client';

import { ReactNode } from 'react';

// import { isServer, QueryClient, QueryClientProvider } from '@tanstack/react-query';

// function makeQueryClient() {
//   return new QueryClient({
//     defaultOptions: {
//       queries: {
//         staleTime: 60 * 1000,
//       },
//     },
//   });
// }

// let browserQueryClient: QueryClient | undefined = undefined;

// function getQueryClient() {
//   if (isServer) {
//     return makeQueryClient();
//   } else {
//     if (!browserQueryClient) browserQueryClient = makeQueryClient();
//     return browserQueryClient;
//   }
// }

// export const QueryProvider = ({ children }: { children: ReactNode }) => {
//   const queryClient = getQueryClient();

//   return <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>;
// };

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

export const QueryProvider = ({ children }: { children: ReactNode }) => {
  const queryClient = new QueryClient();

  return <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>;
};
