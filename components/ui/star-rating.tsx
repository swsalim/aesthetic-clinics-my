'use client';

import { memo } from 'react';

import { StarIcon } from 'lucide-react';

interface PartialStarProps {
  fillPercentage: number;
  className?: string;
}

function PartialStar({ fillPercentage, className = '' }: PartialStarProps) {
  return (
    <div className="relative h-5 w-5">
      <StarIcon className={`h-5 w-5 fill-gray-200 stroke-gray-200 ${className}`} />
      <div
        className="absolute inset-0 overflow-hidden"
        style={{ width: `${fillPercentage * 100}%` }}>
        <StarIcon className="fill-brand h-5 w-5 stroke-transparent" />
      </div>
    </div>
  );
}

interface StarRatingProps {
  rating: number | null;
  showValue?: boolean;
  className?: string;
}

export const StarRating = memo(function StarRating({
  rating = 0,
  showValue = true,
  className = '',
}: StarRatingProps) {
  const ratingValue = rating ?? 0;
  const fullStars = Math.floor(ratingValue);
  const partialStarFill = ratingValue - fullStars;

  return (
    <div className={`flex items-center gap-1 ${className}`}>
      <div className="flex">
        {[1, 2, 3, 4, 5].map((star) => {
          if (star <= fullStars) {
            return <StarIcon key={star} className="fill-brand h-5 w-5 stroke-transparent" />;
          }
          if (star === fullStars + 1 && partialStarFill > 0) {
            return <PartialStar key={star} fillPercentage={partialStarFill} />;
          }
          return <StarIcon key={star} className="h-5 w-5 fill-gray-200 stroke-gray-200" />;
        })}
      </div>
      {showValue && (
        <span className="ml-1 text-sm font-semibold text-gray-500 dark:text-gray-300">
          ({ratingValue.toFixed(1)})
        </span>
      )}
    </div>
  );
});
