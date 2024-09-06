'use client';

import Navbar from '@/app/(main)/_components/navbar';

export default function MainLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <div className='flex h-full dark:bg-[#212121]'>
      <Navbar />
      <main className='h-[2000px] h-full flex-1 overflow-y-auto pt-24'>
        {children}
      </main>
    </div>
  );
}
