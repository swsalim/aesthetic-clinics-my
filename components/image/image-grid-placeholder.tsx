import Link from 'next/link';

import { ImagePlaceholder } from '@/components/image/image-placeholder';

interface ImageGridPlaceholderProps {
  title: string;
  className?: string;
}

export function ImageGridPlaceholder({ title, className }: ImageGridPlaceholderProps) {
  return (
    <div className={`image-grid is-empty relative overflow-y-hidden rounded-lg ${className ?? ''}`}>
      <div className="grid grid-cols-4 grid-rows-2 gap-2">
        <div className="col-span-2 row-span-2 bg-gray-100">
          <div className="h-full w-full">
            <Link
              href="mailto:support@clinicgeek.com"
              target="_blank"
              rel="noreferrer"
              className="block h-full w-full">
              <ImagePlaceholder title={title} />
            </Link>
          </div>
        </div>
        {Array.from({ length: 4 }, (_, index) => (
          <div key={`dummy-${index}`} className="bg-gray-100">
            <div className="h-full w-full">
              <Link
                href="mailto:support@clinicgeek.com"
                target="_blank"
                rel="noreferrer"
                className="block h-full w-full">
                <ImagePlaceholder title={title} />
              </Link>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
