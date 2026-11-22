'use client';

import { useEffect } from 'react';

/** Next.js client navigations to /guides#category do not always scroll. */
export function GuideHashScroll() {
  useEffect(() => {
    const scrollToHash = () => {
      const id = window.location.hash.replace('#', '');
      if (!id) return;
      document.getElementById(id)?.scrollIntoView();
    };

    const onSamePageCategoryClick = (event: MouseEvent) => {
      if (
        event.defaultPrevented ||
        event.button !== 0 ||
        event.metaKey ||
        event.ctrlKey ||
        event.shiftKey ||
        event.altKey
      ) {
        return;
      }

      const anchor = (event.target as Element | null)?.closest?.('a[href]');
      if (!(anchor instanceof HTMLAnchorElement)) return;

      const url = new URL(anchor.href, window.location.href);
      if (url.origin !== window.location.origin || url.pathname !== '/guides' || !url.hash) {
        return;
      }
      if (window.location.pathname !== '/guides') return;

      event.preventDefault();
      if (window.location.hash === url.hash) {
        scrollToHash();
        return;
      }
      window.location.hash = url.hash;
    };

    scrollToHash();
    window.addEventListener('hashchange', scrollToHash);
    document.addEventListener('click', onSamePageCategoryClick, true);
    return () => {
      window.removeEventListener('hashchange', scrollToHash);
      document.removeEventListener('click', onSamePageCategoryClick, true);
    };
  }, []);

  return null;
}
