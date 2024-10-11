import React from 'react';
import { auth } from '@clerk/nextjs/server';
import { Metadata } from 'next';

import { categoriesMetadata } from '@/metadata/metadata';
import { CategoryCard } from './CategoryCard';

export const metadata: Metadata = categoriesMetadata;

const Categories: React.FC = () => {
  const { userId }: { userId: string | null } = auth();

  return (
    <div className="max-w-screen-2xl mx-auto">
      <CategoryCard userId={userId} />
    </div>
  );
};

export default Categories;
