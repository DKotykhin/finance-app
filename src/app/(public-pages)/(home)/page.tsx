'use client';

import React from 'react';

import Image from 'next/image';

import { Card, CardBody } from '@nextui-org/react';
import { useTheme } from 'next-themes';
import { useUser } from '@clerk/nextjs';

import { PaymentSettings } from '@/app/(user-pages)/settings/PaymentSettings';
import { RedirectButton } from './RedirectButton';
import { RatingSystem } from './RatingSystem';

const Homepage = () => {
  const { theme } = useTheme();
  const { user } = useUser();

  return (
    <div className="max-w-screen-2xl mx-auto">
      <div className="mb-12 -mt-40">
        <RedirectButton userId={user?.id} />
        <Card className="mb-4 md:mb-12 p-1 sm:p-4">
          <CardBody>
            <div className="flex flex-col-reverse lg:flex-row gap-4 justify-between items-center">
              <div className="w-fit lg:max-w-[50%]">
                <p className="text-2xl sm:text-3xl md:text-5xl text-blue-600 font-bold mb-4 md:mb-14">
                  Welcome to finance world
                </p>
                <p className="italic font-light">
                  Your all-in-one finance management solution is here. Easily create transactions, categorize your
                  expenses, and manage multiple accounts in one place. With our intuitive dashboard, you can track your
                  spending history and gain insights into your financial health. Get started now and take control of
                  your finances with just a few clicks!
                </p>
              </div>
              <Image
                src="/images/home-1.webp"
                alt="Homepage"
                width={700}
                height={450}
                className="rounded-lg max-h-[450px] object-contain"
              />
            </div>
          </CardBody>
        </Card>
        <Card className="mb-4 md:mb-12 p-1 sm:p-4">
          <CardBody>
            <div className="flex flex-col-reverse lg:flex-row gap-4 justify-between items-center">
              <Image
                src={theme === 'dark' ? '/images/home-5.png' : '/images/home-4.png'}
                alt="Homepage"
                width={700}
                height={450}
                className="rounded-lg max-h-[450px] object-contain"
              />
              <div className="w-fit lg:max-w-[50%]">
                <p className="text-2xl sm:text-3xl md:text-5xl text-blue-600 font-bold mb-4 md:mb-14">
                  Manage your transaction
                </p>
                <p className="italic font-light">
                  Create multiple accounts and different categories. Put incomes and expenses and control all your
                  transactions. Set default categories and accounts for your transactions.
                </p>
              </div>
            </div>
          </CardBody>
        </Card>
        <Card className="mb-4 md:mb-12 p-1 sm:p-4">
          <CardBody>
            <div className="flex flex-col-reverse lg:flex-row gap-4 justify-between items-center">
              <div className="w-fit lg:max-w-[50%]">
                <p className="text-2xl sm:text-3xl md:text-5xl text-blue-600 font-bold mb-4 md:mb-14">
                  Inspire by dashboard
                </p>
                <p className="italic font-light">
                  Get insights into your financial health with our intuitive dashboard. Track your spending history and
                  gain insights into your financial health. Monitor your income and expenses, and stay on top of your
                  financial goals.
                </p>
              </div>
              <Image
                src={theme === 'dark' ? '/images/home-7.png' : '/images/home-6.png'}
                alt="Homepage"
                width={700}
                height={450}
                className="rounded-lg max-h-[450px] object-contain"
              />
            </div>
          </CardBody>
        </Card>
        {user?.id && (
          <>
            <Card className="p-1 sm:p-4">
              <CardBody>
                <PaymentSettings userId={user?.id} />
              </CardBody>
            </Card>
            <RatingSystem userId={user?.id} />
          </>
        )}
        
      </div>
    </div>
  );
};

export default Homepage;
