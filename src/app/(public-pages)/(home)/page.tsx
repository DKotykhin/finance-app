import React from 'react';
import Image from 'next/image';
import { Card, CardBody } from '@nextui-org/react';
import { auth } from '@clerk/nextjs/server';
import { RedirectButton } from './RedirectButton';
import { cn } from '@/utils/cn';

const Homepage = () => {
  const { userId }: { userId: string | null } = auth();

  return (
    <div className="max-w-screen-2xl mx-auto">
      <div className={cn('mb-12', userId ? '-mt-24' : '-mt-44')}>
        {!userId && <RedirectButton />}
        <Card className="mb-12 p-1 sm:p-4">
          <CardBody>
            <div className="flex flex-col-reverse lg:flex-row gap-4 justify-between items-center">
              <p className="text-lg">This is the homepage</p>
              <Image src="/images/home-1.webp" alt="Homepage" width={700} height={500} className="rounded-lg" />
            </div>
          </CardBody>
        </Card>
        <Card className="mb-12 p-1 sm:p-4">
          <CardBody>
            <div className="flex flex-col-reverse lg:flex-row gap-4 justify-between items-center">
              <Image src="/images/home-2.webp" alt="Homepage" width={700} height={500} className="rounded-lg" />
              <p className="text-lg">This is the homepage</p>
            </div>
          </CardBody>
        </Card>
        <Card className="mb-12 p-1 sm:p-4">
          <CardBody>
            <div className="flex flex-col-reverse lg:flex-row gap-4 justify-between items-center">
              <p className="text-lg">This is the homepage</p>
              <Image src="/images/home-4.jpg" alt="Homepage" width={700} height={500} className="rounded-lg" />
            </div>
          </CardBody>
        </Card>
      </div>
    </div>
  );
};

export default Homepage;
