import { Button } from '@nextui-org/react';
import { auth } from '@clerk/nextjs/server';
import { SignInButton, SignedIn, SignedOut, UserButton } from '@clerk/nextjs';

export default function Home() {
  const { userId }: { userId: string | null } = auth();
  return (
    <div>
      <h1>Hello, {userId}</h1>
      <Button color="primary">Button</Button>
      <SignedOut>
        <SignInButton />
      </SignedOut>
      <SignedIn>
        <UserButton />
      </SignedIn>
    </div>
  );
}
