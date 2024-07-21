'use client';

import React, { useState } from 'react';
import { usePathname } from 'next/navigation';
import { Button } from '@nextui-org/react';
import { Menu, X } from 'lucide-react';
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
  const [openMenu, setOpenMenu] = useState(false);
  const pathname = usePathname();

  return (
    <>
      <nav className="hidden lg:flex items-center gap-x-2 overflow-x-auto">
        {routes.map((route) => (
          <div key={route.href}>
            <Button
              size="md"
              variant="bordered"
              className={cn(
                'w-full lg:w-auto justify-between font-normal hover:bg-white/20 hover:text-white border-none text-white',
                pathname === route.href ? 'bg-white/10 text-white' : 'bg-transparent'
              )}
            >
              <Link href={route.href}>{route.label}</Link>
            </Button>
          </div>
        ))}
      </nav>
      <nav className="lg:hidden">
        <Menu
          width={40}
          height={40}
          onClick={() => setOpenMenu(!openMenu)}
          className="text-white bg-white/10 rounded-md p-1"
        />
        {openMenu && (
          <div className="fixed top-0 left-0 w-full h-full bg-gray-950/60 z-40" onClick={() => setOpenMenu(false)}>
            <div className="fixed top-0 left-0 w-72 h-full bg-white z-50 transition-all duration-500">
              <div className='flex justify-end px-2 mt-2'>
                <X width={32} height={32} className="text-blue-950" onClick={() => setOpenMenu(false)} />
              </div>
              {routes.map((route) => (
                <div key={route.href} className="mb-2">
                  <Button size="md" variant="light" onClick={() => setOpenMenu(false)}>
                    <Link href={route.href} className="text-blue-950 text-lg">
                      {route.label}
                    </Link>
                  </Button>
                </div>
              ))}
            </div>
          </div>
        )}
      </nav>
    </>
  );
};

export default Navigation;
