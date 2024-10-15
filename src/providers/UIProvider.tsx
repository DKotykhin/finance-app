'use client';

import React from 'react';
import type { ReactNode } from 'react';

import { NextUIProvider } from '@nextui-org/react';
import { ThemeProvider as NextThemesProvider } from 'next-themes';

export const UIProvider = ({ children }: { children: ReactNode }) => {
  return (
    <NextUIProvider locale="en-GB">
      <NextThemesProvider attribute="class" defaultTheme="light">
        {children}
      </NextThemesProvider>
    </NextUIProvider>
  );
};
