'use client';

import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';

import { cn } from '@/lib/utils';

export type GuideTocItem = {
  id: string;
  text: string;
};

type GuideTocContextValue = {
  items: GuideTocItem[];
  current?: string;
};

const GuideTocContext = createContext<GuideTocContextValue | null>(null);

function useGuideToc() {
  const value = useContext(GuideTocContext);
  if (!value) {
    throw new Error('Guide table of contents must be used inside GuideTocProvider');
  }
  return value;
}

function scrollLine(items: GuideTocItem[]) {
  const first = items.length ? document.getElementById(items[0].id) : null;
  const margin = first ? parseFloat(getComputedStyle(first).scrollMarginTop) || 0 : 0;
  return Math.max(margin, 72) + 8;
}

function useActiveSection(items: GuideTocItem[]) {
  const [current, setCurrent] = useState(items[0]?.id);

  useEffect(() => {
    if (items.length === 0) return;
    let frame = 0;

    const sync = () => {
      const line = scrollLine(items);
      let next = items[0].id;
      for (const item of items) {
        const el = document.getElementById(item.id);
        if (el && el.getBoundingClientRect().top <= line) {
          next = item.id;
        }
      }
      setCurrent((previous) => (previous === next ? previous : next));
    };

    const onScroll = () => {
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(sync);
    };

    sync();
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onScroll);
    window.addEventListener('hashchange', sync);
    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('resize', onScroll);
      window.removeEventListener('hashchange', sync);
    };
  }, [items]);

  useEffect(() => {
    const strips = document.querySelectorAll<HTMLElement>('[data-guide-toc-chips]');
    strips.forEach((scroller) => {
      const active = scroller.querySelector<HTMLElement>('a[aria-current="true"]');
      if (!active) return;
      const left = active.offsetLeft - scroller.clientWidth / 2 + active.offsetWidth / 2;
      scroller.scrollTo({ left: Math.max(0, left), behavior: 'smooth' });
    });
  }, [current]);

  return current;
}

export function GuideTocProvider({
  headings,
  children,
}: {
  headings: GuideTocItem[];
  children: ReactNode;
}) {
  const items = useMemo(
    () => headings.map((heading) => ({ id: heading.id, text: heading.text })),
    [headings],
  );
  const current = useActiveSection(items);
  const value = useMemo(() => ({ items, current }), [items, current]);

  return <GuideTocContext.Provider value={value}>{children}</GuideTocContext.Provider>;
}

const CHIP_CLASS =
  'inline-flex h-9 max-w-[16rem] shrink-0 items-center truncate rounded-full border border-gray-200 !border-b bg-white px-3.5 text-sm font-semibold text-gray-800 hover:border-gray-400 hover:bg-gray-50 hover:text-gray-950 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 active:bg-gray-100 aria-[current=true]:border-gray-950 aria-[current=true]:bg-gray-950 aria-[current=true]:text-white aria-[current=true]:hover:border-gray-950 aria-[current=true]:hover:bg-gray-950 aria-[current=true]:hover:text-white dark:border-gray-700 dark:bg-gray-900 dark:text-gray-100 dark:hover:border-gray-500 dark:hover:bg-gray-800 dark:hover:text-white dark:active:bg-gray-800 dark:aria-[current=true]:border-white dark:aria-[current=true]:bg-white dark:aria-[current=true]:text-gray-950 dark:aria-[current=true]:hover:border-white dark:aria-[current=true]:hover:bg-white dark:aria-[current=true]:hover:text-gray-950';

/** Horizontal section pills, pinned under the site header on small screens. */
export function GuideMobileToc() {
  const { items, current } = useGuideToc();
  if (items.length === 0) return null;

  return (
    <div className="sticky top-16 z-[9] border-b border-gray-200 bg-white/90 backdrop-blur-md md:top-20 lg:hidden dark:border-gray-800 dark:bg-gray-950/90">
      <nav
        aria-label="On this page"
        data-guide-toc-chips
        className="flex gap-2 overflow-x-auto px-6 py-2.5 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
      >
        {items.map((item) => (
          <a
            key={item.id}
            href={`#${item.id}`}
            aria-current={item.id === current ? 'true' : undefined}
            className={CHIP_CLASS}
          >
            {item.text}
          </a>
        ))}
      </nav>
    </div>
  );
}

/** Sticky section rail for the guide sidebar. */
export function GuideDesktopToc() {
  const { items, current } = useGuideToc();
  if (items.length === 0) return null;

  return (
    <nav aria-label="On this page">
      <p className="text-sm font-semibold uppercase tracking-[0.14em] text-gray-500">On this page</p>
      <ol className="mt-3 flex flex-col">
        {items.map((item) => (
          <li key={item.id}>
            <a
              href={`#${item.id}`}
              aria-current={item.id === current ? 'true' : undefined}
              className={cn(
                'block !border-b-0 py-1.5 text-sm leading-6 text-gray-600 hover:!border-b-0 hover:text-gray-950 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2 active:text-gray-950 dark:text-gray-400 dark:hover:text-white dark:active:text-white',
                'aria-[current=true]:font-semibold aria-[current=true]:text-gray-950 dark:aria-[current=true]:text-white',
              )}
            >
              {item.text}
            </a>
          </li>
        ))}
      </ol>
    </nav>
  );
}
