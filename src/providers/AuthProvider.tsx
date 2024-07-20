import React from 'react';
import { ClerkProvider } from '@clerk/nextjs';

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  return <ClerkProvider>{children}</ClerkProvider>;
};
