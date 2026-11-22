import { Star } from '@phosphor-icons/react/dist/ssr';

export function RatingStars({ score }: { score: number }) {
  return (
    <span className="inline-flex items-center" aria-hidden="true">
      {[1, 2, 3, 4, 5].map((star) => {
        const fill = Math.min(1, Math.max(0, score - (star - 1)));

        if (fill >= 1) {
          return <Star key={star} weight="fill" className="size-4 text-amber-400" />;
        }

        if (fill > 0) {
          return (
            <span key={star} className="relative size-4">
              <Star weight="fill" className="size-4 text-gray-200 dark:text-gray-700" />
              <span className="absolute inset-0 overflow-hidden" style={{ width: `${fill * 100}%` }}>
                <Star weight="fill" className="size-4 text-amber-400" />
              </span>
            </span>
          );
        }

        return <Star key={star} weight="fill" className="size-4 text-gray-200 dark:text-gray-700" />;
      })}
    </span>
  );
}
