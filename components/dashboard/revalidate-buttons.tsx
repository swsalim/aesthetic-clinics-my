'use client';

import {
  revalidateAreas,
  revalidateClinics,
  revalidateDoctors,
  revalidateStates,
} from '@/lib/actions/revalidate';

import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/use-toast';

export default function RevalidateButtons() {
  const { toast } = useToast();

  const handleRevalidate = async (action: () => Promise<void>, type: string) => {
    try {
      await action();
      toast({
        title: 'Success',
        description: `${type} data has been revalidated successfully`,
      });
    } catch (error) {
      console.error(`Error revalidating ${type.toLowerCase()}:`, error);
      toast({
        variant: 'destructive',
        title: 'Error',
        description: `Failed to revalidate ${type.toLowerCase()} data`,
      });
    }
  };

  return (
    <div className="my-12 flex flex-row gap-6">
      <Button variant="outline" onClick={() => handleRevalidate(revalidateClinics, 'Clinics')}>
        Revalidate Clinics
      </Button>
      <Button variant="outline" onClick={() => handleRevalidate(revalidateAreas, 'Areas')}>
        Revalidate Areas
      </Button>
      <Button variant="outline" onClick={() => handleRevalidate(revalidateStates, 'States')}>
        Revalidate States
      </Button>
      <Button variant="outline" onClick={() => handleRevalidate(revalidateDoctors, 'Doctors')}>
        Revalidate Doctors
      </Button>
    </div>
  );
}
