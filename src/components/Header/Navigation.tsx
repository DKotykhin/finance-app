'use client';

import React from 'react';
import { usePathname } from 'next/navigation';
import { Button } from '@nextui-org/react';
import Link from 'next/link';
import { cn } from '@/utils/cn';

const routes = [
  {
    href: '/',
    label: 'Overview',
  },
  {
    href: '/transactions',
    label: 'Transactions',
  },
  {
    href: '/accounts',
    label: 'Accounts',
  },
  {
    href: '/categories',
    label: 'Categories',
  },
  {
    href: '/settings',
    label: 'Settings',
  },
];

const Navigation: React.FC = () => {
  const pathname = usePathname();

  return (
    <nav className="hidden lg:flex items-center gap-x-2 overflow-x-auto">
      {routes.map((route) => (
        <div key={route.href}>
          <Button size="sm" variant="bordered" className={cn(
            "w-full lg:w-auto justify-between font-normal hover:bg-white/20 hover:text-white border-none text-white",
            pathname === route.href ? 'bg-white/10 text-white' : 'bg-transparent',
          )}>
            <Link href={route.href}>{route.label}</Link>
          </Button>
        </div>
      ))}
    </nav>
  );
};

export default Navigation;
