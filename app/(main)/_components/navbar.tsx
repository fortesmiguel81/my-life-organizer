import { Button } from '@/components/ui/button';
import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger,
} from '@/components/ui/navigation-menu';
import { useSearch } from '@/hooks/use-search';
import { cn } from '@/lib/utils';
import { ChevronLeft } from 'lucide-react';
import Image from 'next/image';
import React, { ElementRef, useEffect, useRef, useState } from 'react';
import { useMediaQuery } from 'usehooks-ts';
import NavItem from './nav-item';
import UserItem from './user-item';
import { ModeToggle } from '@/components/mode-toggle';

const components: { title: string; href: string; description: string }[] = [
  {
    title: 'Alert Dialog',
    href: '/docs/primitives/alert-dialog',
    description:
      'A modal dialog that interrupts the user with important content and expects a response.',
  },
  {
    title: 'Hover Card',
    href: '/docs/primitives/hover-card',
    description:
      'For sighted users to preview content available behind a link.',
  },
  {
    title: 'Progress',
    href: '/docs/primitives/progress',
    description:
      'Displays an indicator showing the completion progress of a task, typically displayed as a progress bar.',
  },
  {
    title: 'Scroll-area',
    href: '/docs/primitives/scroll-area',
    description: 'Visually or semantically separates content.',
  },
  {
    title: 'Tabs',
    href: '/docs/primitives/tabs',
    description:
      'A set of layered sections of content—known as tab panels—that are displayed one at a time.',
  },
  {
    title: 'Tooltip',
    href: '/docs/primitives/tooltip',
    description:
      'A popup that displays information related to an element when the element receives keyboard focus or the mouse hovers over it.',
  },
];

export default function Navbar() {
  const isMobile = useMediaQuery('(max-width: 768px)');
  const search = useSearch();
  const sidebarRef = useRef<ElementRef<'aside'>>(null);

  const [isResetting, setIsResetting] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  useEffect(() => {
    if (isMobile) {
      handleCollapse();
    } else {
      handleResetWidth();
    }
  }, [isMobile]);

  const handleResetWidth = () => {
    if (sidebarRef.current && isMobile) {
      setIsResetting(true);
      setIsSidebarOpen(true);
      sidebarRef.current.style.width = '260px';

      setTimeout(() => setIsResetting(false), 300);
    }
  };

  const handleCollapse = () => {
    if (sidebarRef.current) {
      setIsResetting(true);
      setIsSidebarOpen(false);
      sidebarRef.current.style.width = '0';

      setTimeout(() => setIsResetting(false), 300);
    }
  };

  return (
    <>
      <aside
        ref={sidebarRef}
        className={cn(
          'group/sidebar fixed z-[99999] flex h-full w-60 flex-col overflow-y-auto bg-secondary lg:hidden',
          isResetting && 'transition-all duration-300 ease-in-out',
          isMobile && 'w-0',
          isSidebarOpen && 'p-3'
        )}
      >
        <div
          onClick={handleCollapse}
          role='button'
          className={cn(
            'absolute right-2 top-3 h-6 w-6 rounded-sm text-muted-foreground opacity-0 transition hover:bg-neutral-300 group-hover/sidebar:opacity-100 dark:hover:bg-neutral-600',
            isMobile && 'opacity-100'
          )}
        >
          <ChevronLeft className='h-6 w-6' />
        </div>
        <div>
          <UserItem />
        </div>
      </aside>
      <div
        className={cn(
          'absolute z-[99998] hidden h-full w-full bg-black/50 blur-sm',
          isSidebarOpen && 'block'
        )}
      />

      <div className='fixed top-0 z-50 flex w-full border-border/40 bg-background/95 p-5 backdrop-blur supports-[backdrop-filter]:bg-background/60'>
        <div className='flex w-full items-center justify-start lg:justify-between'>
          <div className='flex items-center'>
            <div
              className='flex items-center justify-between'
              role={isMobile ? 'button' : undefined}
              onClick={handleResetWidth}
            >
              <Image src='/logo.svg' alt='logo' width={50} height={50} />
              {!isMobile && (
                <h1 className='ml-4 text-xl font-bold'>Life Organizer</h1>
              )}
            </div>
            {!isMobile && (
              <NavigationMenu className='ml-16'>
                <NavigationMenuList>
                  <NavigationMenuItem>
                    <NavigationMenuTrigger>
                      Getting started
                    </NavigationMenuTrigger>
                    <NavigationMenuContent>
                      <ul className='grid gap-3 p-6 md:w-[400px] lg:w-[500px] lg:grid-cols-[.75fr_1fr]'>
                        <li className='row-span-3'>
                          <NavigationMenuLink asChild>
                            <a
                              className='flex h-full w-full select-none flex-col justify-end rounded-md bg-gradient-to-b from-muted/50 to-muted p-6 no-underline outline-none focus:shadow-md'
                              href='/'
                            >
                              <Image
                                src='/logo.svg'
                                alt='Login'
                                width={50}
                                height={50}
                              />
                              <div className='mb-2 mt-4 text-lg font-medium'>
                                shadcn/ui
                              </div>
                              <p className='text-sm leading-tight text-muted-foreground'>
                                Beautifully designed components that you can
                                copy and paste into your apps. Accessible.
                                Customizable. Open Source.
                              </p>
                            </a>
                          </NavigationMenuLink>
                        </li>
                        <NavItem href='/docs' title='Introduction'>
                          Re-usable components built using Radix UI and Tailwind
                          CSS.
                        </NavItem>
                        <NavItem href='/docs/installation' title='Installation'>
                          How to install dependencies and structure your app.
                        </NavItem>
                        <NavItem
                          href='/docs/primitives/typography'
                          title='Typography'
                        >
                          Styles for headings, paragraphs, lists...etc
                        </NavItem>
                      </ul>
                    </NavigationMenuContent>
                  </NavigationMenuItem>
                  <NavigationMenuItem>
                    <NavigationMenuTrigger>Components</NavigationMenuTrigger>
                    <NavigationMenuContent>
                      <ul className='grid w-[400px] gap-3 p-4 md:w-[500px] md:grid-cols-2 lg:w-[600px]'>
                        {components.map((component) => (
                          <NavItem
                            key={component.title}
                            title={component.title}
                            href={component.href}
                          >
                            {component.description}
                          </NavItem>
                        ))}
                      </ul>
                    </NavigationMenuContent>
                  </NavigationMenuItem>
                </NavigationMenuList>
              </NavigationMenu>
            )}
          </div>
          <div className='ml-3 flex w-full items-center gap-3 lg:ml-0 lg:w-auto'>
            <div className='h-full w-full flex-1 md:w-auto md:flex-none'>
              <Button
                onClick={search.OnOpen}
                className='relative inline-flex h-full w-full items-center justify-start whitespace-nowrap rounded-[0.5rem] border border-input bg-muted/50 px-4 py-2 text-sm font-normal text-muted-foreground shadow-none transition-colors hover:bg-accent hover:text-accent-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 sm:pr-12 md:w-40 lg:w-64'
              >
                <span>Search...</span>
                <kbd className='pointer-events-none absolute right-[0.3rem] hidden h-5 select-none items-center gap-1 rounded border bg-muted px-1.5 font-mono text-[10px] font-medium opacity-100 sm:flex'>
                  <span className='text-xs'>CTRL K</span>
                </kbd>
              </Button>
            </div>
            <ModeToggle />
            {!isMobile && <UserItem />}
          </div>
        </div>
      </div>
    </>
  );
}
