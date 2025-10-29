import React from 'react';

import { cn } from '@/lib/utils';

import { ImageKit } from '@/components/image/image-kit';

const Logo: React.FC<React.HTMLAttributes<HTMLDivElement>> = ({ className, ...props }) => {
  return (
    <>
      <span className="sr-only">Aesthetic Clinics</span>
      <div
        className={cn(
          'relative flex h-16 w-16 items-center justify-center sm:h-16 sm:w-16',
          className,
        )}
        aria-hidden="true"
        {...props}>
        <ImageKit
          src="aesthetic-clinics-my-v3.png"
          directory="logos"
          alt="Aesthetic Clinics Malaysia"
          width={300}
          height={300}
          className="h-full w-auto object-contain"
          priority
        />
      </div>
    </>
  );
};

export default Logo;
