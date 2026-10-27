'use client';

import { Car as CarIcon } from '@phosphor-icons/react/dist/ssr';

import { selineTrack } from '@/lib/analytics';
import { cn } from '@/lib/utils';

import { Button } from '@/components/ui/button';

export function GetDirectionButton({
  clinicSlug,
  name,
  className,
  variant = 'outline',
}: {
  clinicSlug: string;
  name: string;
  className?: string;
  variant?: 'outline' | 'primary';
}) {
  const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    try {
      selineTrack(`get_directions_click_${clinicSlug}`);
      window.location.href = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(name)}`;
    } catch (error) {
      console.error('Error firing analytics event:', error);
    }
  };

  return (
    <Button
      variant={variant}
      className={cn(
        'flex items-center justify-center gap-x-2 p-3',
        variant === 'outline' &&
          'flex-grow-0 text-blue-500 hover:text-blue-400 dark:text-blue-300 dark:hover:text-blue-400',
        className,
      )}
      onClick={handleClick}
    >
      <CarIcon weight="duotone" className="h-5 w-5" /> Get Directions
    </Button>
  );
}
