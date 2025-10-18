import Container from '@/components/ui/container';
import { Skeleton } from '@/components/ui/skeleton';
import { Wrapper } from '@/components/ui/wrapper';

export default function DentistsLoading() {
  return (
    <Wrapper>
      <Container>
        <div className="space-y-8">
          <div>
            <Skeleton className="mb-4 h-8 w-64" />
            <Skeleton className="h-6 w-full max-w-2xl" />
          </div>

          <div className="space-y-6">
            <Skeleton className="h-6 w-48" />
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
              {Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="space-y-3 rounded-lg border p-4">
                  <Skeleton className="h-5 w-3/4" />
                  <Skeleton className="h-4 w-1/2" />
                  <Skeleton className="h-4 w-2/3" />
                </div>
              ))}
            </div>
          </div>

          <div className="space-y-6">
            <Skeleton className="h-6 w-48" />
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
              {Array.from({ length: 9 }).map((_, i) => (
                <Skeleton key={i} className="h-16 w-full" />
              ))}
            </div>
          </div>
        </div>
      </Container>
    </Wrapper>
  );
}
