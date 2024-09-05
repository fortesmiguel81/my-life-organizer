import Spinner from '@/components/spinner';
import { ClerkLoaded, ClerkLoading, SignUp } from '@clerk/nextjs';
import Image from 'next/image';
import React from 'react';

export default function SignInPage() {
  return (
    <div className='grid min-h-screen grid-cols-1 lg:grid-cols-2'>
      <div className='h-full flex-col items-center justify-center px-4 lg:flex'>
        <div className='space-y-4 pt-16 text-center'>
          <h1 className='text-3xl font-bold'>Welcome back!</h1>
          <p className='text-base text-muted-foreground'>
            Log in to your account to get back to your dashboard.
          </p>
        </div>
        <div className='mt-8 flex items-center justify-center'>
          <ClerkLoaded>
            <SignUp path='/sign-up' />
          </ClerkLoaded>
          <ClerkLoading>
            <Spinner size='icon' />
          </ClerkLoading>
        </div>
      </div>
      <div className='hidden h-full items-center justify-center bg-blue-600 lg:flex'>
        <Image src='/logo.svg' alt='Login' width={300} height={300} />
      </div>
    </div>
  );
}
