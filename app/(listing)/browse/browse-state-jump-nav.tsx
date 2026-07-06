'use client';

import { useEffect } from 'react';

import { scrollToBrowseState } from './browse-scroll';

type BrowseStateJumpNavProps = {
  states: { id: string; name: string; slug: string }[];
};

export function BrowseStateJumpNav({ states }: BrowseStateJumpNavProps) {
  useEffect(() => {
    const hash = window.location.hash;
    if (!hash.startsWith('#state-')) {
      return;
    }

    const slug = hash.replace('#state-', '');
    requestAnimationFrame(() => {
      scrollToBrowseState(slug, 'auto');
    });
  }, []);

  return (
    <nav
      aria-label="Jump to state"
      className="min-w-0 overflow-x-auto pb-1 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
      <ul className="flex min-w-max gap-2">
        {states.map((state) => (
          <li key={state.id}>
            <a
              href={`#state-${state.slug}`}
              onClick={(event) => {
                event.preventDefault();
                scrollToBrowseState(state.slug);
              }}
              className="inline-flex items-center rounded-full border border-gray-200 bg-white px-3 py-1.5 text-sm font-medium capitalize text-gray-700 no-underline transition hover:border-blue-200 hover:bg-blue-50 hover:text-blue-700 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-200 dark:hover:border-blue-700 dark:hover:bg-blue-950/40 dark:hover:text-blue-300">
              {state.name}
            </a>
          </li>
        ))}
      </ul>
    </nav>
  );
}
