import Prose from '@/components/ui/prose';

interface ReviewSkeletonProps {
  count?: number;
}

export function ReviewSkeleton({ count = 4 }: ReviewSkeletonProps) {
  return (
    <article>
      <Prose>
        <div className="h-4 w-1/4 rounded bg-gray-200 dark:bg-gray-700"></div>
      </Prose>
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 md:grid-cols-3 md:gap-8 lg:grid-cols-4">
        {Array.from({ length: count }).map((_, index) => (
          <div
            key={index}
            className="animate-pulse rounded-lg border border-gray-200 bg-white p-6 shadow-md dark:border-gray-700 dark:bg-gray-950/40">
            <div className="space-y-2">
              <div className="h-4 w-3/4 rounded bg-gray-200 dark:bg-gray-700"></div>
              <div className="h-3 w-1/2 rounded bg-gray-200 dark:bg-gray-700"></div>
              <div>
                <div className="h-3 w-2/3 rounded bg-gray-200 dark:bg-gray-700"></div>
                <div className="h-3 w-1/5 rounded bg-gray-200 dark:bg-gray-700"></div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </article>
  );
}
