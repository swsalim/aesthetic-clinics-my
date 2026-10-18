'use client';

import { useEffect, useRef, useState } from 'react';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

import { Menu, X } from 'lucide-react';

import { cn } from '@/lib/utils';

import { advertiseNavItem, isNavItemActive, primaryNavItems } from './site-links';

const mobileNavItems = [...primaryNavItems, advertiseNavItem];

const FOCUSABLE = 'a[href], button:not([disabled]):not([tabindex="-1"])';

export default function NavMobile() {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();
  const rootRef = useRef<HTMLDivElement>(null);
  const toggleRef = useRef<HTMLButtonElement>(null);
  const restoreFocusRef = useRef(true);

  useEffect(() => {
    if (!open) return;
    const previous = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = previous;
    };
  }, [open]);

  useEffect(() => {
    setOpen(false);
  }, [pathname]);

  useEffect(() => {
    if (!open) return;
    const root = rootRef.current;
    const toggle = toggleRef.current;
    if (!root) return;

    const getFocusable = () => Array.from(root.querySelectorAll<HTMLElement>(FOCUSABLE));

    const frame = window.requestAnimationFrame(() => {
      toggle?.focus();
    });

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        event.preventDefault();
        restoreFocusRef.current = true;
        setOpen(false);
        return;
      }
      if (event.key !== 'Tab') return;

      const items = getFocusable();
      if (items.length === 0) return;

      const first = items[0];
      const last = items[items.length - 1];
      const active = document.activeElement;

      if (!root.contains(active)) {
        event.preventDefault();
        (event.shiftKey ? last : first).focus();
        return;
      }

      if (event.shiftKey && active === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && active === last) {
        event.preventDefault();
        first.focus();
      }
    };

    document.addEventListener('keydown', onKeyDown);
    return () => {
      window.cancelAnimationFrame(frame);
      document.removeEventListener('keydown', onKeyDown);
      if (restoreFocusRef.current) {
        toggle?.focus();
      }
      restoreFocusRef.current = true;
    };
  }, [open]);

  return (
    <div
      ref={rootRef}
      className="lg:hidden"
      role={open ? 'dialog' : undefined}
      aria-modal={open ? true : undefined}
      aria-label={open ? 'Menu' : undefined}
    >
      <button
        ref={toggleRef}
        type="button"
        onClick={() => {
          restoreFocusRef.current = true;
          setOpen((current) => !current);
        }}
        aria-expanded={open}
        aria-controls="mobile-primary-nav"
        aria-label={open ? 'Close menu' : 'Open menu'}
        className={cn(
          'fixed right-3 top-3 z-50 inline-flex size-11 items-center justify-center rounded-full border transition-colors duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2',
          open
            ? 'border-gray-200 bg-white/95 text-gray-700 shadow-sm backdrop-blur hover:bg-gray-50 focus-visible:ring-blue-500 active:bg-gray-100 dark:border-gray-700 dark:bg-gray-900/95 dark:text-gray-200 dark:hover:bg-gray-800 dark:focus-visible:ring-offset-gray-900 dark:active:bg-gray-700'
            : 'border-white/40 bg-white/15 text-white hover:bg-white/25 focus-visible:ring-white focus-visible:ring-offset-blue-500 active:bg-white/30',
        )}
      >
        {open ? (
          <X className="size-5" aria-hidden="true" />
        ) : (
          <Menu className="size-5" aria-hidden="true" />
        )}
      </button>

      {open ? (
        <button
          type="button"
          tabIndex={-1}
          aria-label="Close menu overlay"
          className="fixed inset-0 z-30 bg-gray-900/20 backdrop-blur-[1px] dark:bg-black/40"
          onClick={() => {
            restoreFocusRef.current = true;
            setOpen(false);
          }}
        />
      ) : null}

      <nav
        id="mobile-primary-nav"
        aria-label="Primary"
        className={cn(
          'fixed inset-x-0 top-0 z-40 hidden max-h-[calc(100dvh-6.5rem)] overflow-y-auto border-b border-gray-200 bg-white py-4 pl-5 pr-16 shadow-lg dark:border-gray-800 dark:bg-gray-900',
          open && 'block',
        )}
      >
        <ul className="divide-y divide-gray-100 dark:divide-gray-800">
          {mobileNavItems.map((item) => {
            const active = isNavItemActive(pathname, item);
            const Icon = item.icon;

            return (
              <li key={item.href}>
                <Link
                  href={item.href}
                  onClick={() => {
                    restoreFocusRef.current = false;
                    setOpen(false);
                  }}
                  prefetch={false}
                  aria-current={active ? 'page' : undefined}
                  className={cn(
                    'flex min-h-11 items-center gap-3 py-3 transition-colors duration-150 hover:border-transparent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2 dark:focus-visible:ring-offset-gray-900',
                    active
                      ? 'text-blue-500 dark:text-blue-300'
                      : 'text-gray-900 hover:text-gray-900 dark:text-gray-100 dark:hover:text-gray-100',
                  )}
                >
                  <span
                    className={cn(
                      'inline-flex size-9 shrink-0 items-center justify-center rounded-lg border bg-gray-50 dark:bg-gray-800',
                      active
                        ? 'border-blue-200 bg-blue-50 text-blue-500 dark:border-blue-800 dark:bg-blue-900/40 dark:text-blue-300'
                        : 'border-gray-200 text-gray-600 dark:border-gray-700 dark:text-gray-300',
                    )}
                  >
                    <Icon className="size-4" aria-hidden="true" />
                  </span>
                  <span className="min-w-0">
                    <span className="block font-semibold">{item.name}</span>
                    <span className="block text-sm font-normal text-gray-500 dark:text-gray-400">
                      {item.description}
                    </span>
                  </span>
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>
    </div>
  );
}
