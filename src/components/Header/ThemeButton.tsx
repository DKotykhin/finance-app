'use client';

import React, { useEffect, useState } from 'react';

import { useTheme } from 'next-themes';
import { Tooltip } from '@nextui-org/react';
import { Moon, Sun } from 'lucide-react';

export const ThemeButton: React.FC = () => {
  const [mounted, setMounted] = useState(false);
  const { theme, setTheme } = useTheme();

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  return (
    <Tooltip content="Switch theme">
      {theme === 'dark' ? (
        <Moon color="#fff" className="cursor-pointer" onClick={() => setTheme('light')} />
      ) : (
        <Sun color="#fff" className="cursor-pointer" onClick={() => setTheme('dark')} />
      )}
    </Tooltip>
  );
};
