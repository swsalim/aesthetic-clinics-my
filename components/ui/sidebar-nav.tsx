'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import { buttonVariants } from '@/components/ui/button';

interface SidebarNavItem {
  href: string;
  title: string;
}

interface SidebarNavProps extends React.HTMLAttributes<HTMLElement> {
  items: SidebarNavItem[];
  className?: string;
}

export function SidebarNav({ className, items, ...props }: SidebarNavProps) {
  const pathname = usePathname();

  return (
    <nav
      className={cn('flex space-x-2 lg:flex-col lg:space-x-0 lg:space-y-1', className)}
      {...props}>
      {items.map((item) => (
        <Link
          key={item.href}
          href={item.href}
          className={cn(
            buttonVariants({ variant: 'outline' }),
            pathname === item.href
              ? 'bg-gray-100 hover:bg-gray-100'
              : 'hover:bg-gray-50 hover:bg-transparent',
            'justify-start',
          )}
          aria-current={pathname === item.href ? 'page' : undefined}>
          {item.title}
        </Link>
      ))}
    </nav>
  );
}
