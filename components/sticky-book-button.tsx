'use client';

import { useEffect, useState } from 'react';

import { useMediaQuery } from '@/lib/hooks/use-media-query';
import { cn } from '@/lib/utils';

import Container from '@/components/ui/container';

import { BookAppointmentButton } from './listing/book-appointment-button';

export function StickyBookButton({
  phone,
  stateSlug,
  areaSlug,
  clinicSlug,
}: {
  phone: string;
  stateSlug: string;
  areaSlug: string;
  clinicSlug: string;
}) {
  const [isVisible, setIsVisible] = useState(false);
  const { isMobile } = useMediaQuery();

  useEffect(() => {
    if (!isMobile) return; // Only observe on mobile

    const observer = new IntersectionObserver(
      ([entry]) => {
        setIsVisible(!entry.isIntersecting);
      },
      {
        threshold: 0,
        rootMargin: '0px 0px 0px 0px', // Only trigger when button is actually out of view
      },
    );

    const target = document.querySelector('#book-appointment-button');
    if (target) {
      observer.observe(target);
    }

    return () => {
      if (target) {
        observer.unobserve(target);
      }
    };
  }, [isMobile]); // Re-run when isMobile changes

  if (!isMobile) return null; // Don't render on desktop

  return (
    <div
      className={cn(
        'fixed bottom-0 left-0 right-0 z-50 transform border-t border-gray-200 bg-white p-4 shadow-2xl transition-transform duration-300 dark:border-gray-800 dark:bg-gray-950',
        isVisible ? 'translate-y-0' : 'translate-y-full',
      )}>
      <Container>
        <BookAppointmentButton
          phone={phone}
          stateSlug={stateSlug}
          areaSlug={areaSlug}
          clinicSlug={clinicSlug}
        />
      </Container>
    </div>
  );
}
