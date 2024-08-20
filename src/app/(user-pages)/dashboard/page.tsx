import { auth } from '@clerk/nextjs/server';
import { Dashboard } from './Dashboard';

export default function DashboardPage() {
  const { userId }: { userId: string | null } = auth();
  
  return (
    <div className="max-w-screen-2xl mx-auto">
      <Dashboard userId={userId} />
    </div>
  );
}
