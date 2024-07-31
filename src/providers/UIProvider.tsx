'use client';

import React from 'react';
import { ReactNode } from 'react';

import { NextUIProvider } from '@nextui-org/react';

export const UIProvider = ({ children }: { children: ReactNode }) => {
  return <NextUIProvider locale='en-GB'>{children}</NextUIProvider>;
};
