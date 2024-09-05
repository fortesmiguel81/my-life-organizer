'use client';

import Navigation from '@/components/navigation';

export default function MainLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <div className='flex h-full dark:bg-[#1f1f1f]'>
      <Navigation />
      <main className='h-full flex-1 overflow-y-auto'>{children}</main>
    </div>
  );
}
