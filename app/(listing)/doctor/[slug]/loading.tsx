import Container from '@/components/ui/container';
import { Skeleton } from '@/components/ui/skeleton';
import { Wrapper } from '@/components/ui/wrapper';

export default function DentistLoading() {
  return (
    <Wrapper>
      <Container>
        <div className="space-y-8">
          {/* Breadcrumbs */}
          <Skeleton className="h-4 w-64" />

          {/* Doctor Header */}
          <div className="space-y-4">
            <Skeleton className="h-8 w-96" />
            <Skeleton className="h-6 w-64" />
            <Skeleton className="h-5 w-80" />
          </div>

          {/* Photos */}
          <div className="space-y-4">
            <Skeleton className="h-6 w-24" />
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
              {Array.from({ length: 3 }).map((_, i) => (
                <Skeleton key={i} className="h-48 w-full" />
              ))}
            </div>
          </div>

          {/* About */}
          <div className="space-y-4">
            <Skeleton className="h-6 w-20" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-3/4" />
            <Skeleton className="h-4 w-5/6" />
          </div>

          {/* Video */}
          <div className="space-y-4">
            <Skeleton className="h-6 w-20" />
            <Skeleton className="aspect-video w-full" />
          </div>

          {/* Practices */}
          <div className="space-y-4">
            <Skeleton className="h-6 w-32" />
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
              {Array.from({ length: 3 }).map((_, i) => (
                <div key={i} className="space-y-3 rounded-lg border p-4">
                  <Skeleton className="h-5 w-3/4" />
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-4 w-1/2" />
                </div>
              ))}
            </div>
          </div>

          {/* CTA */}
          <div className="space-y-4 rounded-lg bg-blue-50 p-6">
            <Skeleton className="mx-auto h-6 w-48" />
            <Skeleton className="mx-auto h-4 w-80" />
            <div className="flex justify-center space-x-4">
              <Skeleton className="h-12 w-32" />
              <Skeleton className="h-12 w-32" />
            </div>
          </div>
        </div>
      </Container>
    </Wrapper>
  );
}
