import { CheckIcon } from 'lucide-react';

import { cn } from '@/lib/utils';

import Container from '@/components/ui/container';

/* Hallmark · pre-emit critique: P4 H5 E5 S4 R4 V4
 * macrostructure: Letter · genre: editorial · tone: utilitarian
 * section-head: S3 band panel · enrichment: Tier-A gradient wash
 * audience: directory visitors · use: orient before content · anchor: site blue
 */

interface PageHeadingProps {
  label?: string;
  title: string;
  children?: React.ReactNode;
  highlights?: string[];
  className?: string;
}

export default function PageHeading({
  label,
  title,
  children,
  highlights,
  className,
}: PageHeadingProps) {
  return (
    <div className={cn('mb-8 md:mb-12', className)}>
      <Container className="min-w-0">
        <header className="relative min-w-0 overflow-hidden rounded-2xl border border-blue-100 bg-gradient-to-br from-blue-50 via-white to-blue-100/40 px-6 py-9 shadow-sm sm:px-10 sm:py-11 dark:border-gray-700 dark:from-gray-800 dark:via-gray-800 dark:to-blue-950/50 dark:shadow-none">
          <div
            className="pointer-events-none absolute -right-10 -top-10 size-40 rounded-full bg-blue-300/20 blur-3xl dark:bg-blue-600/10"
            aria-hidden="true"
          />
          <div
            className="pointer-events-none absolute bottom-0 left-0 h-1 w-full bg-gradient-to-r from-blue-500 via-blue-400/60 to-transparent dark:from-blue-400 dark:via-blue-500/50 dark:to-transparent"
            aria-hidden="true"
          />

          <div className="relative min-w-0">
            {label && (
              <p className="mb-4">
                <span className="inline-flex items-center rounded-full border border-blue-200/80 bg-white/70 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-blue-700 backdrop-blur-sm dark:border-gray-600 dark:bg-gray-900/80 dark:text-blue-300">
                  {label}
                </span>
              </p>
            )}

            <h1 className="max-w-3xl text-balance font-display text-[clamp(2rem,5vw,3rem)] font-black leading-[1.08] tracking-tight text-gray-900 [overflow-wrap:anywhere] dark:text-gray-50">
              {title}
            </h1>

            {children && (
              <div className="mt-5 max-w-2xl text-balance text-base font-medium leading-relaxed text-gray-600 md:text-lg dark:text-gray-300 [&_a]:font-semibold [&_a]:text-blue-400 [&_a]:hover:text-blue-300 [&_p]:m-0">
                {children}
              </div>
            )}

            {highlights && highlights.length > 0 && (
              <ul className="mt-7 flex min-w-0 flex-col gap-2.5 sm:flex-row sm:flex-wrap sm:gap-3">
                {highlights.map((item) => (
                  <li key={item} className="min-w-0">
                    <span className="inline-flex min-h-9 max-w-full items-center gap-2 rounded-full border border-blue-200/80 bg-white/80 px-3.5 py-2 text-sm font-medium text-gray-800 shadow-sm backdrop-blur-sm dark:border-gray-600 dark:bg-gray-900/80 dark:text-gray-200 dark:shadow-none">
                      <CheckIcon
                        className="size-4 shrink-0 text-blue-500 dark:text-blue-400"
                        aria-hidden="true"
                      />
                      <span className="min-w-0 text-balance">{item}</span>
                    </span>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </header>
      </Container>
    </div>
  );
}
