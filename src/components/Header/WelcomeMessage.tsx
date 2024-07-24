'use client';

import React from 'react';
import { useUser } from '@clerk/nextjs';

const WelcomeMessage: React.FC = () => {
  const { user, isLoaded } = useUser();

  return (
    <div className="space-y-2">
      <h2 className="text-2xl lg:text-3xl font-semibold text-white">Welcome to Finance</h2>
      <p className="text-white">{isLoaded ? user?.fullName : ''}</p>
      <p className="text-blue-200">Manage your finances easily with Finance</p>
    </div>
  );
};

export default WelcomeMessage;
