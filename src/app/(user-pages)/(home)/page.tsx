import { auth } from '@clerk/nextjs/server';

export default function Home() {
  const { userId }: { userId: string | null } = auth();
  return (
    <div>
      <h1>Hello, {userId}</h1>
    </div>
  );
}
