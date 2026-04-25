import Image from "next/image";

import { auth } from "@clerk/nextjs/server";
import { ClerkLoaded, ClerkLoading, SignIn } from "@clerk/nextjs";
import { redirect } from "next/navigation";

import Spinner from "@/components/spinner";

export default async function SignInPage({
  searchParams,
}: {
  searchParams: { redirect_url?: string };
}) {
  const { userId } = auth();

  if (userId) {
    const target = searchParams.redirect_url ?? "/dashboard";
    // Only allow relative or same-origin redirects
    const safe = target.startsWith("http")
      ? new URL(target).pathname + new URL(target).search
      : target;
    redirect(safe);
  }

  return (
    <div className="grid min-h-screen grid-cols-1 lg:grid-cols-2">
      <div className="h-full flex-col items-center justify-center px-4 lg:flex">
        <div className="space-y-4 pt-16 text-center">
          <h1 className="text-3xl font-bold">Welcome back!</h1>
          <p className="text-base text-muted-foreground">
            Log in to your account to get back to your dashboard.
          </p>
        </div>
        <div className="mt-8 flex items-center justify-center">
          <ClerkLoaded>
            <SignIn path="/sign-in" />
          </ClerkLoaded>
          <ClerkLoading>
            <Spinner size="icon" />
          </ClerkLoading>
        </div>
      </div>
      <div className="hidden h-full items-center justify-center bg-blue-600 lg:flex">
        <Image src="/logo.svg" alt="Login" width={300} height={300} />
      </div>
    </div>
  );
}
