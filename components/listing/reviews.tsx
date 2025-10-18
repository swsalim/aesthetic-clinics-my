import Link from 'next/link';

import { ClinicReview } from '@/types/clinic';
import { formatDistanceToNow } from 'date-fns';
import { ArrowRightIcon } from 'lucide-react';

import { cn } from '@/lib/utils';

import { buttonVariants } from '../ui/button';
import { Card, CardContent, CardFooter, CardHeader } from '../ui/card';
import { StarRating } from '../ui/star-rating';
import { TruncatedText } from '../ui/truncated-text';

interface ReviewsProps {
  reviews: Partial<ClinicReview>[];
  clinicSlug: string;
}

export default function Reviews({ reviews, clinicSlug }: ReviewsProps) {
  if (!reviews || reviews.length === 0) {
    return null;
  }

  return (
    <article>
      <h2>Reviews</h2>
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
        {reviews.map(({ author_name, rating, text, review_time }) => (
          <Card key={`${author_name}-${review_time}`}>
            <CardHeader>
              <StarRating rating={rating ?? 0} showValue={false} />
            </CardHeader>
            {text && (
              <CardContent>
                <TruncatedText text={text} />
              </CardContent>
            )}
            <CardFooter className="flex flex-col items-start gap-1">
              <span className="text-base font-semibold text-gray-700 dark:text-gray-50">
                {author_name}
              </span>
              {review_time && (
                <span className="text-sm text-gray-500 dark:text-gray-300">
                  {formatDistanceToNow(new Date(review_time), { addSuffix: true })}
                </span>
              )}
            </CardFooter>
          </Card>
        ))}
      </div>
      <div className="mt-4 flex flex-row gap-x-2 md:mt-6">
        <Link
          href={`/place/${clinicSlug}/reviews`}
          className={cn(buttonVariants({ variant: 'primary' }), 'not-prose flex flex-row gap-x-2')}>
          View all reviews
          <ArrowRightIcon className="size-4" />
        </Link>
      </div>
    </article>
  );
}
