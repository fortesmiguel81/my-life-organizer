'use client';

import Navbar from '@/app/(main)/_components/navbar';
import SearchCommand from '@/components/search-command';

export default function MainLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <div className='h-full dark:bg-[#212121]'>
      <Navbar />
      <main className='h-full flex-1 overflow-y-auto pt-24'>
        <SearchCommand />
        {children}
      </main>
    </div>
  );
}
