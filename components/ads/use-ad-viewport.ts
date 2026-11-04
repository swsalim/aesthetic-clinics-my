'use client';

import { useEffect, useRef, useState } from 'react';

declare global {
  interface Window {
    adsbygoogle: Array<Record<string, unknown>>;
  }
}

type UseAdViewportOptions = {
  /** IntersectionObserver rootMargin. Ignored when `eager` is true. */
  rootMargin?: string;
  /** Request the unit immediately — use for above-fold / rail placements. */
  eager?: boolean;
};

/** Placeholder surface while AdSense has not reported a filled unit. */
export const AD_PLACEHOLDER_CLASS = 'bg-gray-200/40 dark:bg-gray-700';

function isFilledIns(ins: Element | null) {
  if (!ins) return false;
  return (
    ins.hasAttribute('data-ad-status') || ins.getAttribute('data-adsbygoogle-status') === 'done'
  );
}

function isAdFilled(ins: Element | null) {
  return ins?.getAttribute('data-ad-status') === 'filled';
}

export function useAdViewport({ rootMargin = '250px', eager = false }: UseAdViewportOptions = {}) {
  const ref = useRef<HTMLElement>(null);
  const pushedRef = useRef(false);
  const [isInView, setIsInView] = useState(eager);
  const [adFilled, setAdFilled] = useState(false);

  useEffect(() => {
    if (eager) return;

    const element = ref.current;
    if (!element) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsInView(true);
          observer.disconnect();
        }
      },
      { rootMargin, threshold: 0 },
    );

    observer.observe(element);
    return () => observer.disconnect();
  }, [eager, rootMargin]);

  useEffect(() => {
    if (!isInView || pushedRef.current) return;

    const ins = ref.current?.querySelector('.adsbygoogle') ?? null;
    if (isFilledIns(ins)) {
      pushedRef.current = true;
      setAdFilled(isAdFilled(ins));
      return;
    }

    try {
      pushedRef.current = true;
      (window.adsbygoogle = window.adsbygoogle || []).push({});
    } catch (err) {
      pushedRef.current = false;
      console.error('Error loading AdSense:', err);
    }
  }, [isInView]);

  useEffect(() => {
    if (!isInView) return;

    const root = ref.current;
    if (!root) return;

    const ins = root.querySelector('.adsbygoogle');
    if (!ins) return;

    const update = () => setAdFilled(isAdFilled(ins));
    update();

    const observer = new MutationObserver(update);
    observer.observe(ins, { attributes: true, attributeFilter: ['data-ad-status'] });
    return () => observer.disconnect();
  }, [isInView]);

  return { ref, isInView, adFilled };
}
