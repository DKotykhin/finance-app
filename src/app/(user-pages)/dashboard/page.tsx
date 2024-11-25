import { auth } from '@clerk/nextjs/server';
import type { Metadata } from 'next';

import { dashboardMetadata } from '@/metadata/metadata';
import { Dashboard } from './Dashboard';

export const metadata: Metadata = dashboardMetadata;

export default async function DashboardPage() {
  const { userId }: { userId: string | null } = await auth();
  
  return (
    <div className="max-w-screen-2xl mx-auto">
      <Dashboard userId={userId} />
    </div>
  );
}
