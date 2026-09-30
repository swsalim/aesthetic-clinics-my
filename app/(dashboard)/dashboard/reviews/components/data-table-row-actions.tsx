'use client';

import { useState } from 'react';

import { useRouter } from 'next/navigation';

import { Row } from '@tanstack/react-table';
import { MenuIcon } from 'lucide-react';

import { revalidateClinicReview } from '@/lib/actions/revalidate';
import { createClient } from '@/lib/supabase/client';

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { toast } from '@/components/ui/use-toast';

import { ReviewTableData } from '../columns';

interface DataTableRowActionsProps<TData> {
  row: Row<TData>;
}

export function DataTableRowActions<TData extends ReviewTableData>({
  row,
}: DataTableRowActionsProps<TData>) {
  const review = row.original;
  const router = useRouter();
  const supabase = createClient();
  const [open, setOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);

  const refreshPublicReview = async () => {
    try {
      await revalidateClinicReview(review.clinic?.slug ? [review.clinic.slug] : []);
    } catch (error) {
      console.error('Error revalidating review pages:', error);
    }
  };

  const onDeleteReview = async () => {
    if (isDeleting) return;

    try {
      setIsDeleting(true);
      const { error } = await supabase.from('clinic_reviews').delete().eq('id', review.id);
      if (error) throw error;

      await refreshPublicReview();
      toast({ title: 'Review deleted' });
      router.refresh();
    } catch (error) {
      console.error('Error deleting review:', error);
      toast({
        variant: 'destructive',
        title: 'Could not delete review',
        description: error instanceof Error ? error.message : 'Failed to delete review',
      });
    } finally {
      setIsDeleting(false);
      setOpen(false);
    }
  };

  const updateStatus = async (status: 'approved' | 'rejected') => {
    if (isUpdating) return;

    try {
      setIsUpdating(true);
      const { error } = await supabase
        .from('clinic_reviews')
        .update({ status })
        .eq('id', review.id);
      if (error) throw error;

      await refreshPublicReview();
      toast({
        title: status === 'approved' ? 'Review approved' : 'Review rejected',
      });
      router.refresh();
    } catch (error) {
      console.error('Error updating review status:', error);
      toast({
        variant: 'destructive',
        title: 'Could not update review',
        description: error instanceof Error ? error.message : 'Failed to update review',
      });
    } finally {
      setIsUpdating(false);
    }
  };

  return (
    <>
      <AlertDialog open={open} onOpenChange={setOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete this review?</AlertDialogTitle>
            <AlertDialogDescription>
              This permanently deletes the review by{' '}
              <span className="font-medium text-gray-900">&quot;{review.author_name}&quot;</span>
              {review.clinic?.name ? ` for ${review.clinic.name}` : ''}.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeleting}>Cancel</AlertDialogCancel>
            <AlertDialogAction asChild>
              <Button variant="danger" onClick={onDeleteReview} disabled={isDeleting}>
                {isDeleting ? 'Deleting...' : 'Delete review'}
              </Button>
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant="ghost"
            className="flex h-8 w-8 justify-center p-0 data-[state=open]:bg-gray-100"
          >
            <MenuIcon className="h-4 w-4" />
            <span className="sr-only">Open menu</span>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-[160px]">
          <DropdownMenuItem
            onSelect={() => {
              router.push(`/dashboard/reviews/edit/${review.id}`);
            }}
            className="w-full cursor-pointer"
          >
            Edit
          </DropdownMenuItem>
          {review.status !== 'approved' && (
            <DropdownMenuItem onSelect={() => updateStatus('approved')} disabled={isUpdating}>
              Approve
            </DropdownMenuItem>
          )}
          {review.status !== 'rejected' && (
            <DropdownMenuItem onSelect={() => updateStatus('rejected')} disabled={isUpdating}>
              Reject
            </DropdownMenuItem>
          )}
          <DropdownMenuSeparator />
          <DropdownMenuItem
            onSelect={(event) => {
              event.preventDefault();
              setOpen(true);
            }}
            className="cursor-pointer text-red-600 focus:text-red-600"
          >
            Delete
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </>
  );
}
