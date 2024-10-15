'use client';

import React, { useState } from 'react';

import { usePathname } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';

import { Button, Divider } from '@nextui-org/react';
import { Menu, X } from 'lucide-react';

import { cn } from '@/utils/cn';

const routes = [
  {
    href: '/',
    label: 'Home',
  },
  {
    href: '/dashboard',
    label: 'Dashboard',
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
        {routes.map(route => (
          <div key={route.href}>
            <Button
              size="md"
              variant="bordered"
              className={cn(
                'w-full lg:w-auto font-normal hover:bg-white/20 hover:text-white border-none text-white',
                pathname === route.href ? 'bg-white/10 text-white' : 'bg-transparent'
              )}
            >
              <Link href={route.href}>{route.label}</Link>
            </Button>
          </div>
        ))}
      </nav>
      <nav className="lg:hidden z-30">
        <Menu
          width={40}
          height={40}
          onClick={() => setOpenMenu(!openMenu)}
          className="text-white bg-white/10 rounded-md p-1"
        />
        <div
          className={cn(
            'fixed inset-0 bg-black bg-opacity-50 backdrop-blur-sm transition-opacity duration-300 ease-in-out',
            openMenu ? 'opacity-100' : 'opacity-0 pointer-events-none'
          )}
          onClick={() => setOpenMenu(false)}
        ></div>
        <div
          className={`fixed top-0 left-0 min-w-[250px] h-full p-4 bg-white shadow-md rounded-md transform transition-all duration-300 ease-in-out z-50 ${
            openMenu ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-4 pointer-events-none'
          }`}
          onClick={() => setOpenMenu(false)}
        >
          <div className="flex justify-end px-2 mt-2">
            <X width={32} height={32} className="text-blue-950" />
          </div>
          <Link href="/" className="flex p-4">
            <Image src="/logo-blue.svg" width={30} height={30} alt="logo" />
            <p className="ml-2 text-blue-600 text-3xl font-semibold">Finance</p>
          </Link>
          <Divider className="my-4" />
          {routes.map((route, index) => (
            <div key={route.href} className="mb-4">
              <Button size="md" variant="light" onClick={() => setOpenMenu(false)}>
                <Link
                  href={route.href}
                  className={cn('text-xl', pathname === route.href ? 'text-blue-600 font-semibold' : 'text-blue-950')}
                >
                  {route.label}
                </Link>
              </Button>
              {index !== routes.length - 1 && <Divider className="mt-4" />}
            </div>
          ))}
        </div>
      </nav>
    </>
  );
};

export default Navigation;
