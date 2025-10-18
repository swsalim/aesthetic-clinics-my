'use client';

import { useState } from 'react';

import { useRouter } from 'next/navigation';

import { Row } from '@tanstack/react-table';
import { MenuIcon } from 'lucide-react';

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
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { ToastAction } from '@/components/ui/toast';
import { toast } from '@/components/ui/use-toast';

import { DoctorTableData } from '../columns';

// import { taskSchema } from '../data/schema';

interface DataTableRowActionsProps<TData> {
  row: Row<TData>;
}

export function DataTableRowActions<TData extends DoctorTableData>({
  row,
}: DataTableRowActionsProps<TData>) {
  const doctor = row.original;
  const router = useRouter();
  const supabase = createClient();
  const [open, setOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isToggling, setIsToggling] = useState(false);

  const onDeleteListing = async () => {
    if (isDeleting) return;

    try {
      setIsDeleting(true);

      // First, fetch images from clinic_images table
      const { data: doctorImages, error: fetchError } = await supabase
        .from('clinic_doctor_images')
        .select('imagekit_file_id')
        .eq('doctor_id', doctor.id);

      if (fetchError) {
        console.error('Error fetching doctor images:', fetchError);
      }

      const tableName = 'clinic_doctors';
      const { error } = await supabase.from(tableName).delete().match({ id: doctor.id });

      if (error) throw error;

      // Delete images from ImageKit if they exist
      if (doctorImages && doctorImages.length > 0) {
        for (const imageRecord of doctorImages) {
          if (imageRecord.imagekit_file_id) {
            try {
              const response = await fetch('/api/delete-imagekit', {
                method: 'POST',
                headers: {
                  'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                  imagekit_file_id: imageRecord.imagekit_file_id,
                }),
              });

              if (!response.ok) {
                console.warn('Failed to delete image from ImageKit:', imageRecord.imagekit_file_id);
              }
            } catch (error) {
              console.error('Error deleting image from ImageKit:', error);
            }
          }
        }

        // Delete image records from clinic_images table
        const { error: deleteImagesError } = await supabase
          .from('clinic_doctor_images')
          .delete()
          .eq('doctor_id', doctor.id);

        if (deleteImagesError) {
          console.error('Error deleting clinic image records:', deleteImagesError);
        }
      }
      toast({
        title: 'You have deleted the listing successfully',
      });
      router.refresh();
    } catch (error) {
      console.error('Error deleting listing:', error);
      toast({
        variant: 'destructive',
        title: 'Uh oh! Something went wrong.',
        description: error instanceof Error ? error.message : 'Failed to delete listing',
        action: <ToastAction altText="Try again">Try again</ToastAction>,
      });
    } finally {
      setIsDeleting(false);
      setOpen(false);
    }
  };

  const handleToggleActive = async () => {
    if (isToggling) return;

    try {
      setIsToggling(true);
      const tableName = 'clinic_doctors';
      const { error } = await supabase
        .from(tableName)
        .update({
          is_active: !doctor.is_active,
        })
        .eq('id', doctor.id);

      if (error) throw error;

      toast({
        title: `Doctor ${!doctor.is_active ? 'activated' : 'deactivated'} successfully`,
      });

      router.refresh();
    } catch (error) {
      console.error('Error toggling active state:', error);
      toast({
        variant: 'destructive',
        title: 'Failed to update active state',
        description: error instanceof Error ? error.message : 'An unknown error occurred',
      });
    } finally {
      setIsToggling(false);
    }
  };

  return (
    <>
      <AlertDialog open={open} onOpenChange={setOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete{' '}
              <span className="font-medium text-gray-900">&quot;{doctor.name}&quot;</span> from our
              database.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeleting}>Cancel</AlertDialogCancel>
            <AlertDialogAction asChild>
              <Button variant="danger" onClick={onDeleteListing} disabled={isDeleting}>
                {isDeleting ? 'Deleting...' : 'Delete Listing'}
              </Button>
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant="ghost"
            className="flex h-8 w-8 justify-center p-0 data-[state=open]:bg-gray-100">
            <MenuIcon className="h-4 w-4" />
            <span className="sr-only">Open menu</span>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-[160px]">
          <DropdownMenuItem
            onSelect={() => {
              router.push(`/dashboard/doctors/edit/${doctor.id}`);
            }}
            className="w-full cursor-pointer">
            Edit
          </DropdownMenuItem>
          <DropdownMenuItem onSelect={handleToggleActive} disabled={isToggling}>
            {isToggling ? 'Updating...' : `${doctor.is_active ? 'Deactivate' : 'Activate'}`}
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem>
            <AlertDialog open={open} onOpenChange={setOpen}>
              <AlertDialogTrigger>Delete</AlertDialogTrigger>
            </AlertDialog>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </>
  );
}
