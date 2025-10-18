'use client';

import { ChangeEvent, useState } from 'react';
import { useForm } from 'react-hook-form';

import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

import type { ClinicState } from '@/types/clinic';
import { zodResolver } from '@hookform/resolvers/zod';
import { RefreshCwIcon, XIcon } from 'lucide-react';
import * as z from 'zod';

// Lib imports
import { createClient } from '@/lib/supabase/client';
import { sanitizeHtmlField } from '@/lib/utils';

import { FileInput } from '@/components/form-fields/file';
import { Input } from '@/components/form-fields/input';
import { Textarea } from '@/components/form-fields/textarea';
import { Button } from '@/components/ui/button';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { toast } from '@/components/ui/use-toast';

interface EditStateFormProps {
  state: Partial<ClinicState>;
}

const clinicProfileSchema = z.object({
  name: z.string(),
  slug: z.string(),
  short_description: z.string().optional(),
  description: z.string().optional(),
  image: z.any().optional(),
});

type ClinicStateFormData = z.infer<typeof clinicProfileSchema>;

export default function FormEditState({ state }: EditStateFormProps) {
  const router = useRouter();
  const supabase = createClient();

  const [currentImage, setCurrentImage] = useState<string | undefined>(state.image || '');
  const [currentImagekitFileId, setCurrentImagekitFileId] = useState<string | undefined>(
    state.imagekit_file_id || '',
  );
  const [shouldRemoveImage, setShouldRemoveImage] = useState(false);
  const [imageToRemove, setImageToRemove] = useState<string | null>(null);

  const form = useForm<ClinicStateFormData>({
    resolver: zodResolver(clinicProfileSchema),
    defaultValues: {
      name: state.name || '',
      slug: state.slug,
      description: state.description || undefined,
      short_description: state.short_description || undefined,
      image: '',
    },
    mode: 'onChange',
  });

  const { reset } = form;
  const { isSubmitting } = form.formState;
  const watchImage = form.watch('image');

  const handleImageChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files?.length) return;
    const file = Array.from(e.target.files)[0];
    form.setValue('image', file);
  };

  const handleImageRemove = () => {
    form.setValue('image', '');
  };

  const handleImagekitImageRemove = (e: React.MouseEvent) => {
    e.preventDefault();
    // Store the file ID before clearing it so we can delete from ImageKit
    const fileIdToRemove = currentImagekitFileId;
    setCurrentImage(undefined);
    setCurrentImagekitFileId(undefined);
    setShouldRemoveImage(true);
    form.setValue('image', '');

    // Store the file ID in a ref or state that persists until form submission
    if (fileIdToRemove) {
      setImageToRemove(fileIdToRemove);
    }
  };

  const deleteImagekitImage = async (fileId: string): Promise<boolean> => {
    try {
      const response = await fetch('/api/delete-imagekit', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          imagekit_file_id: fileId,
        }),
      });

      if (!response.ok) {
        console.warn('Failed to delete image from ImageKit');
        return false;
      }
      return true;
    } catch (error) {
      console.error('Error deleting image from ImageKit:', error);
      return false;
    }
  };

  const renderImage = (image: string | File, isCurrentImage = false) => {
    const imageSrc = !isCurrentImage
      ? URL.createObjectURL(image as globalThis.File)
      : (image as string);

    return (
      <div className="mt-4 grid grid-cols-4 gap-4">
        <div className="relative aspect-square overflow-hidden rounded-md shadow-md">
          <button
            className="absolute left-auto right-2 top-2 z-10 h-8 w-8 rounded-full border-2 border-gray-700 bg-white/90"
            onClick={(e) => {
              if (!isCurrentImage) {
                handleImageRemove();
              } else {
                handleImagekitImageRemove(e);
              }
            }}
            aria-label="Remove image"
            tabIndex={0}>
            <XIcon className="mx-auto h-6 w-6" />
          </button>
          <Image
            className="h-full w-full object-cover"
            src={imageSrc}
            alt="Image preview"
            width={600}
            height={600}
          />
        </div>
      </div>
    );
  };

  const onSubmit = async (data: ClinicStateFormData) => {
    console.log('onSubmit ~ data');
    console.log(data);
    try {
      let imagekitImage: string | undefined;
      let imagekitFileId: string | undefined;

      // Handle image removal/replacement logic
      if (shouldRemoveImage && imageToRemove) {
        await deleteImagekitImage(imageToRemove);
        // Clear the current image references since we're removing the image
        setCurrentImage(undefined);
        setCurrentImagekitFileId(undefined);
      }

      // If we have a new image and there's an existing ImageKit file ID, delete the old image
      // (This handles the case where we're replacing an image, not just removing it)
      if (watchImage && currentImagekitFileId && !shouldRemoveImage) {
        await deleteImagekitImage(currentImagekitFileId);
      }

      // Upload new image if provided
      if (watchImage && watchImage instanceof globalThis.File) {
        try {
          const formData = new FormData();
          formData.append('file', watchImage);
          formData.append('folder', 'aesthetic-clinics-my/location');
          formData.append('fileName', `state-${state.slug}-${Date.now()}`);
          formData.append('tags', 'state,thumbnail');
          formData.append('useUniqueFileName', 'true');

          const response = await fetch('/api/upload-imagekit', {
            method: 'POST',
            body: formData,
          });

          if (!response.ok) {
            throw new Error('Failed to upload image');
          }

          const imagekitData = (await response.json()) as unknown as {
            success: boolean;
            imagekit_file_id: string;
            url: string;
          };

          if (imagekitData.success && imagekitData.imagekit_file_id) {
            imagekitImage =
              imagekitData.url ||
              `https://ik.imagekit.io/yuurrific/aesthetic-clinics-my/location/${imagekitData.imagekit_file_id}`;
            setCurrentImagekitFileId(imagekitData.imagekit_file_id);
            imagekitFileId = imagekitData.imagekit_file_id;
          } else {
            throw new Error('Invalid response from image upload');
          }
        } catch (error) {
          console.error('Image upload error:', error);
          toast({
            variant: 'destructive',
            title: 'Image upload failed',
            description: 'Failed to upload the new image. Please try again.',
          });
          return;
        }
      }

      // Determine the final image values based on removal state and new image upload
      // If we're removing AND uploading new image, use the new image
      // If we're just removing without new image, set to null
      const finalImage = shouldRemoveImage && !watchImage ? null : imagekitImage || currentImage;
      const finalImagekitFileId =
        shouldRemoveImage && !watchImage ? null : imagekitFileId || undefined;

      const finalData = {
        ...data,
        id: state.id,
        description: sanitizeHtmlField(data.description),
        short_description: sanitizeHtmlField(data.short_description),
        image: finalImage,
        imagekit_file_id: finalImagekitFileId,
      };

      console.log('finalData');
      console.log(finalData);

      // Update area information
      const { data: updatedState, error: updateError } = await supabase
        .from('states')
        .upsert({
          id: state.id,
          // GENERAL
          name: finalData.name,
          description: finalData.description,
          short_description: finalData.short_description,
          slug: finalData.slug,
          // IMAGE RELATED
          image: finalData.image,
          imagekit_file_id: finalData.imagekit_file_id,
        })
        .select()
        .single();

      if (updateError) {
        throw updateError;
      }

      if (updatedState) {
        // Update the form with the new data
        reset({
          name: updatedState.name || '',
          slug: updatedState.slug || '',
          description: updatedState.description || undefined,
          short_description: updatedState.short_description || undefined,
          image: '',
        });

        // Update the current images state
        setCurrentImage(updatedState.image || '');
        setCurrentImagekitFileId(updatedState.imagekit_file_id || '');
      }

      toast({
        title: 'Success',
        description: 'State updated successfully',
      });

      // Reset form state
      setShouldRemoveImage(false);
      setImageToRemove(null);
      router.refresh();
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to update state';
      console.error('Error updating state:', errorMessage);
      toast({
        title: 'Error',
        description: errorMessage,
        variant: 'destructive',
      });
    } finally {
      form.reset();
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} aria-label="Clinic review form">
        <div className="space-y-6 divide-y divide-gray-200 shadow sm:overflow-hidden sm:rounded-md">
          <div className="space-y-6 bg-white px-4 py-6 sm:p-6">
            <div>
              <h3 className="text-lg font-medium leading-6 text-gray-900">Edit State</h3>
              <p className="text-text-gray-500 mt-1 text-sm">
                This information will be displayed publicly so be careful what you share.
              </p>
            </div>

            <div className="grid grid-cols-6 gap-8">
              <div className="col-span-6 sm:col-span-3">
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Name</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="Enter state name"
                          aria-describedby="name-description"
                          {...field}
                        />
                      </FormControl>
                      <FormDescription id="name-description">
                        This is the name that will be displayed on the state page.
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className="col-span-6 space-y-4">
                <h4 className="text-base font-medium text-gray-900">Number of Clinics</h4>
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
                  {state.clinics?.length}
                </div>
              </div>

              <div className="col-span-6 sm:col-span-5">
                <FormField
                  control={form.control}
                  name="slug"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="block">Slug</FormLabel>
                      <FormControl>
                        <Input placeholder="url-slug" {...field} />
                      </FormControl>
                      <FormDescription>This is the url for the state page.</FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className="col-span-6">
                <FormField
                  control={form.control}
                  name="short_description"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="block">Short Description</FormLabel>
                      <FormControl>
                        <Textarea
                          advanced
                          placeholder="Type the description here."
                          rows={10}
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className="col-span-6">
                <FormField
                  control={form.control}
                  name="description"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="block">Description</FormLabel>
                      <FormControl>
                        <Textarea
                          advanced
                          placeholder="Type the description here."
                          rows={10}
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              {currentImage && (
                <div className="col-span-6">
                  <h3>Current Image</h3>
                  {renderImage(currentImage, true)}
                </div>
              )}
              <div className="col-span-6">
                <FormField
                  control={form.control}
                  name="image"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Image</FormLabel>
                      <FormControl>
                        <FileInput id="image" {...field} value="" onChange={handleImageChange} />
                      </FormControl>
                      <FormDescription>Upload image for the state</FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                {watchImage && renderImage(watchImage)}
              </div>
            </div>
          </div>
        </div>
        <div className="col-span-6 mt-6 flex justify-between space-x-4">
          <Link href="/dashboard/states">Back</Link>
          <Button type="submit" disabled={isSubmitting} className="flex items-center space-x-2">
            {isSubmitting ? (
              <>
                <RefreshCwIcon className="h-4 w-4 animate-spin" />
                <span>Updating State Info...</span>
              </>
            ) : (
              <span>Update</span>
            )}
          </Button>
        </div>
      </form>
    </Form>
  );
}
