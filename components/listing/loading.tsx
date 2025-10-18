import Container from '@/components/ui/container';
import { Wrapper } from '@/components/ui/wrapper';

export default function Loading() {
  return (
    <Wrapper className="bg-gray-50 dark:bg-gray-950/30">
      <Container>
        <div className="mb-10 flex flex-col gap-2 text-center md:mb-12">
          <div className="h-6 w-32 animate-pulse rounded bg-gray-200 dark:bg-gray-800" />
          <div className="h-10 w-96 animate-pulse rounded bg-gray-200 dark:bg-gray-800" />
          <div className="h-6 w-72 animate-pulse rounded bg-gray-200 dark:bg-gray-800" />
        </div>
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {[...Array(8)].map((_, i) => (
            <div
              key={i}
              className="flex flex-col gap-4 rounded-lg border bg-white p-4 shadow-sm dark:border-gray-800 dark:bg-gray-900">
              <div className="aspect-video animate-pulse rounded-lg bg-gray-200 dark:bg-gray-800" />
              <div className="h-6 w-3/4 animate-pulse rounded bg-gray-200 dark:bg-gray-800" />
              <div className="h-4 w-1/2 animate-pulse rounded bg-gray-200 dark:bg-gray-800" />
            </div>
          ))}
        </div>
      </Container>
    </Wrapper>
  );
}
