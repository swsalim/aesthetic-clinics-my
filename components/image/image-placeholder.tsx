import { CameraIcon } from 'lucide-react';

interface ImagePlaceholderProps {
  title?: string;
  isPerson?: boolean;
  className?: string;
}

export function ImagePlaceholder({ title, isPerson = false, className }: ImagePlaceholderProps) {
  return (
    <div
      className={`flex h-full flex-col items-center justify-center rounded-md bg-gray-100 px-4 py-4 ${
        isPerson ? 'min-h-[300px]' : ''
      } ${className ?? ''}`}
      role="img"
      aria-label={title ? `Placeholder for ${title}` : 'Image placeholder'}>
      {!isPerson ? (
        <>
          <CameraIcon className="h-10 w-10 text-gray-600" aria-hidden="true" />
          {title && (
            <p className="mb-0 mt-3 text-center text-gray-600">
              Add image for {title} <span className="sr-only">:)</span>
            </p>
          )}
        </>
      ) : (
        <svg
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
          strokeWidth="1.5"
          stroke="currentColor"
          className="h-10 w-10"
          aria-hidden="true">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M17.982 18.725A7.488 7.488 0 0012 15.75a7.488 7.488 0 00-5.982 2.975m11.963 0a9 9 0 10-11.963 0m11.963 0A8.966 8.966 0 0112 21a8.966 8.966 0 01-5.982-2.275M15 9.75a3 3 0 11-6 0 3 3 0 016 0z"
          />
        </svg>
      )}
    </div>
  );
}
