'use client';

import { MenuIcon } from 'lucide-react';

interface NavbarProps {
  isCollapsed: boolean;
  onResetWidth: () => void;
}

export default function Navbar({ isCollapsed, onResetWidth }: NavbarProps) {
  return (
    <>
      <nav className='flex w-full items-center gap-x-4 bg-background px-3 py-2 dark:bg-[#1f1f1f]'>
        {isCollapsed && (
          <MenuIcon
            role='button'
            onClick={onResetWidth}
            className='h-6 w-6 text-muted-foreground'
          />
        )}
      </nav>
    </>
  );
}
