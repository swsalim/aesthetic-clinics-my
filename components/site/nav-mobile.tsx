'use client';

import { ElementType, useEffect, useState } from 'react';

import Link from 'next/link';

import { ChevronDown, Menu, X } from 'lucide-react';

import { cn } from '@/lib/utils';

import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';

import { navItems } from './navbar';

export default function NavMobile() {
  const [open, setOpen] = useState(false);
  // prevent body scroll when modal is open
  useEffect(() => {
    if (open) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'auto';
    }
  }, [open]);

  return (
    <div>
      <button
        onClick={() => setOpen(!open)}
        className={cn(
          'fixed right-3 top-3 isolate z-50 rounded-full p-2 transition-colors duration-200 hover:bg-gray-50 focus:outline-none active:bg-gray-100 lg:hidden dark:hover:bg-gray-800',
        )}>
        {open ? (
          <X className="h-5 w-5 text-gray-600 dark:text-gray-300" />
        ) : (
          <Menu className="h-5 w-5 text-gray-600 dark:text-gray-300" />
        )}
      </button>
      <nav
        className={cn(
          'fixed inset-0 z-30 hidden max-h-screen w-full overflow-y-auto bg-white px-5 py-16 lg:hidden dark:bg-gray-900',
          open && 'block',
        )}>
        <ul className="grid divide-y divide-gray-100 dark:divide-gray-800">
          {navItems.map(({ name, href, childItems }, idx) => (
            <MobileNavItem
              key={idx}
              name={name}
              href={href}
              childItems={childItems}
              setOpen={setOpen}
            />
          ))}
        </ul>
      </nav>
    </div>
  );
}

const MobileNavItem = ({
  name,
  href,
  childItems,
  setOpen,
}: {
  name: string;
  href?: string;
  childItems?: {
    title: string;
    description?: string;
    isExternal?: boolean;
    href: string;
    icon?: ElementType;
    iconClassName?: string;
  }[];
  setOpen: (open: boolean) => void;
}) => {
  const [expanded, setExpanded] = useState(false);

  if (childItems && childItems.length > 0) {
    return (
      <li>
        <Collapsible open={expanded} onOpenChange={setExpanded}>
          <CollapsibleTrigger className="flex w-full items-center justify-between py-3">
            <p className="font-semibold text-gray-900 dark:text-gray-300">{name}</p>
            <ChevronDown
              className={cn(
                'h-5 w-5 text-gray-500 transition-all dark:text-gray-400',
                expanded && 'rotate-180',
              )}
            />
          </CollapsibleTrigger>
          <CollapsibleContent
            className={cn(
              'duration overflow-hidden transition-all ease-in-out',
              'data-[state=closed]:animate-slide-up',
              'data-[state=open]:animate-slide-down',
            )}>
            <div className="grid gap-1 overflow-hidden pb-4">
              {childItems.map(({ title, href, icon: Icon, description }) => (
                <Link
                  key={href}
                  href={href}
                  onClick={() => setOpen(false)}
                  className="group flex w-full gap-3 py-2"
                  prefetch={false}>
                  {Icon && (
                    <div className="flex size-10 items-center justify-center rounded-lg border border-gray-200 bg-gradient-to-t from-gray-100">
                      <Icon className="size-5 text-gray-700" />
                    </div>
                  )}
                  <div>
                    <div className="flex items-center gap-2">
                      <h2 className="text-sm font-medium text-gray-900 group-hover:text-blue-400 dark:text-gray-300">
                        {title}
                      </h2>
                    </div>
                    <p className="text-sm text-gray-500 dark:text-gray-400">{description}</p>
                  </div>
                </Link>
              ))}
            </div>
          </CollapsibleContent>
        </Collapsible>
      </li>
    );
  }

  if (!href) {
    return null;
  }

  return (
    <li>
      <Link
        href={href}
        onClick={() => setOpen(false)}
        className="flex w-full py-3 font-semibold capitalize"
        prefetch={false}>
        {name}
      </Link>
    </li>
  );
};
