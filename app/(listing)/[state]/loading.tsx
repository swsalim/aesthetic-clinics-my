import { ClinicCardSkeleton } from '@/components/cards/clinic-card-skeleton';
import Container from '@/components/ui/container';
import { Wrapper } from '@/components/ui/wrapper';

export default function StatePageLoading() {
  return (
    <>
      <Wrapper
        style={{
          backgroundSize: 'cover',
          backgroundPosition: 'center center',
          backgroundRepeat: 'no-repeat',
          position: 'relative',
        }}
        className="before:absolute before:inset-0 before:bg-black/50 before:content-['']">
        <Container className="relative z-10">
          <div className="flex flex-col gap-4 py-12 md:py-24">
            <div className="h-6 w-48 animate-pulse rounded bg-gray-200 dark:bg-gray-700" />
            <div className="h-12 w-3/4 animate-pulse rounded bg-gray-200 dark:bg-gray-700" />
            <div className="h-6 w-2/3 animate-pulse rounded bg-gray-200 dark:bg-gray-700" />
          </div>
        </Container>
      </Wrapper>
      <Wrapper size="sm">
        <Container>
          <div className="flex flex-col gap-y-6">
            <div className="h-8 w-48 animate-pulse rounded bg-gray-200 dark:bg-gray-700" />
            <div className="grid grid-cols-2 gap-2 md:grid-cols-3 md:gap-4 lg:grid-cols-4">
              {Array.from({ length: 8 }).map((_, i) => (
                <div key={i} className="h-6 animate-pulse rounded bg-gray-200 dark:bg-gray-700" />
              ))}
            </div>
          </div>
        </Container>
      </Wrapper>
      <Wrapper>
        <Container>
          <div className="h-8 w-64 animate-pulse rounded bg-gray-200 dark:bg-gray-700" />
          <div className="mt-6 grid grid-cols-1 gap-6 sm:grid-cols-2 md:grid-cols-3 md:gap-8 lg:grid-cols-4">
            {Array.from({ length: 8 }).map((_, i) => (
              <ClinicCardSkeleton key={i} />
            ))}
          </div>
        </Container>
      </Wrapper>
    </>
  );
}
