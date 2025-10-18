'use client';

import { ChangeEvent, useState } from 'react';
import { useForm } from 'react-hook-form';

import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

import type { ClinicDoctor, ClinicImage } from '@/types/clinic';
import { zodResolver } from '@hookform/resolvers/zod';
import { CheckIcon, ChevronsUpDown, RefreshCwIcon, XIcon } from 'lucide-react';
import * as z from 'zod';

// Lib imports
import { createClient } from '@/lib/supabase/client';
import { cn, generateUniqueFilename, sanitizeHtmlField } from '@/lib/utils';

import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
} from '@/components/dashboard/command';
import { FileInput } from '@/components/form-fields/file';
import { Input } from '@/components/form-fields/input';
import { SelectContent, SelectItem } from '@/components/form-fields/select';
import { SelectTrigger, SelectValue } from '@/components/form-fields/select';
import { Select } from '@/components/form-fields/select';
import { Switch } from '@/components/form-fields/switch';
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
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { toast } from '@/components/ui/use-toast';

interface EditDoctorFormProps {
  doctor: Partial<ClinicDoctor>;
  clinics: {
    id: string;
    name: string;
    slug: string;
  }[];
}

const STATUS_OPTIONS = [
  { label: 'Pending', value: 'pending' },
  { label: 'Approved', value: 'approved' },
  { label: 'Rejected', value: 'rejected' },
  { label: 'Suspended', value: 'suspended' },
];

const doctorProfileSchema = z.object({
  name: z.string(),
  slug: z.string(),
  bio: z.string().optional(),
  specialty: z.string().optional(),
  qualification: z.string().optional(),
  status: z.string().optional(),
  images: z.array(z.any()).optional(),
  featured_video: z.string().optional(),
  is_active: z.boolean(),
  is_featured: z.boolean(),
  selectedClinics: z.array(z.object({ clinic_id: z.string(), clinic_slug: z.string() })),
});

type FormData = z.infer<typeof doctorProfileSchema>;

export default function FormEditDoctor({ doctor, clinics }: EditDoctorFormProps) {
  const router = useRouter();
  const supabase = createClient();

  const [currentImages, setCurrentImages] = useState<ClinicImage[]>(doctor.images || []);
  const [imagesToRemove, setImagesToRemove] = useState<string[]>([]);

  const form = useForm<FormData>({
    resolver: zodResolver(doctorProfileSchema),
    defaultValues: {
      name: doctor.name || '',
      slug: doctor.slug || '',
      bio: doctor.bio || '',
      specialty: doctor.specialty || '',
      qualification: doctor.qualification || '',
      status: doctor.status || '',
      images: [],
      featured_video: doctor.featured_video || '',
      is_active: doctor.is_active || false,
      is_featured: doctor.is_featured || false,
      selectedClinics:
        doctor.clinics?.map((clinic) => ({
          clinic_id: clinic.id,
          clinic_slug: clinic.slug,
        })) || [],
    },
    mode: 'onChange',
  });

  const { reset } = form;
  const { isSubmitting } = form.formState;
  const watchImages = form.watch('images');

  const handleImagesChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files?.length) return;
    const files = Array.from(e.target.files);
    const newFiles = [...(watchImages || []), ...files];
    form.setValue('images', newFiles);
  };

  const handleImageRemove = (indexToRemove: number) => {
    if (!indexToRemove) return;

    const updatedImages = (watchImages || []).filter((image, index) => index !== indexToRemove);
    form.setValue('images', updatedImages);
  };

  const handleImagekitImageRemove = (e: React.MouseEvent, imageToRemove: string) => {
    e.preventDefault();

    // Store the imagekit_file_id for removal during form submission
    const imageToRemoveObj = currentImages.find((img) => img.image_url === imageToRemove);
    if (imageToRemoveObj) {
      setImagesToRemove((prev) => [...prev, imageToRemoveObj.imagekit_file_id]);
    }

    // Remove from current images array (just visually, not from database yet)
    const filterImages = currentImages.filter((image) => image.image_url !== imageToRemove);
    setCurrentImages(filterImages);
  };

  const uploadImageToImageKit = async (
    imageFile: File,
  ): Promise<{ url: string; fileId: string } | null> => {
    try {
      // Validate file size (max 3MB)
      const maxSize = 3 * 1024 * 1024; // 3MB
      if (imageFile.size > maxSize) {
        throw new Error('Image file size must be less than 2MB');
      }

      // Validate file type
      if (!imageFile.type.startsWith('image/')) {
        throw new Error('Please select a valid image file');
      }

      const formData = new FormData();
      formData.append('file', imageFile);
      formData.append('folder', 'aesthetic-clinics-my/persons');
      formData.append('fileName', generateUniqueFilename(imageFile.name));

      const response = await fetch('/api/upload-imagekit', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || `Upload failed with status: ${response.status}`);
      }

      const data = await response.json();

      if (data.success && data.imagekit_file_id) {
        return {
          url:
            data.url ||
            `https://ik.imagekit.io/yuurrific/aesthetic-clinics-my/persons/${data.imagekit_file_id}`,
          fileId: data.imagekit_file_id,
        };
      } else {
        throw new Error('Invalid response from image upload');
      }
    } catch (error) {
      console.error('Image upload error:', error);
      toast({
        variant: 'destructive',
        title: 'Upload failed',
        description: error instanceof Error ? error.message : 'Failed to upload image',
      });
      return null;
    }
  };

  const renderImages = (images: (ClinicImage | File)[], isCurrentImage = false) => {
    return (
      <div className="mt-4 grid grid-cols-4 gap-4">
        {images.map((image, index) => {
          let imageSrc;

          if (!isCurrentImage) {
            imageSrc = URL.createObjectURL(image as File);
          } else {
            imageSrc = (image as ClinicImage).image_url;
          }

          return (
            <div key={index}>
              <div className="aspect-h-3 aspect-w-4 relative overflow-hidden rounded-md shadow-md">
                {!isCurrentImage && (
                  <button
                    className="absolute left-auto right-2 top-2 z-10 h-8 w-8 rounded-full border-2 border-gray-700 bg-white/90"
                    onClick={() => handleImageRemove(index)}>
                    <XIcon className="mx-auto h-6 w-6"></XIcon>
                  </button>
                )}
                {isCurrentImage && (
                  <button
                    className="absolute left-auto right-2 top-2 z-10 h-8 w-8 rounded-full border-2 border-gray-700 bg-white/90"
                    onClick={(e) => handleImagekitImageRemove(e, (image as ClinicImage).image_url)}>
                    <XIcon className="mx-auto h-6 w-6"></XIcon>
                  </button>
                )}
                {!isCurrentImage && (
                  <Image
                    src={imageSrc}
                    alt="Image preview"
                    width={600}
                    height={600}
                    className="object-cover"
                  />
                )}

                {isCurrentImage && (
                  <Image
                    src={imageSrc}
                    alt="Image preview"
                    width={600}
                    height={600}
                    className="object-cover"
                  />
                )}
              </div>
            </div>
          );
        })}
      </div>
    );
  };

  const onSubmit = async (data: FormData) => {
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) throw new Error('User not found');

      console.log('imagesToRemove', imagesToRemove);

      for (const imagekitFileId of imagesToRemove) {
        try {
          // Delete from to_be_reviewed_clinic_images table
          const { error: deleteError } = await supabase
            .from('clinic_doctor_images')
            .delete()
            .eq('imagekit_file_id', imagekitFileId);

          if (deleteError) {
            console.error('Error deleting image record:', deleteError);
          }

          // Delete from ImageKit
          const deleteResponse = await fetch('/api/delete-imagekit', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({ imagekit_file_id: imagekitFileId }),
          });

          if (!deleteResponse.ok) {
            console.error('Error deleting image from ImageKit:', imagekitFileId);
          }
        } catch (error) {
          console.error('Error marking image for removal:', error);
        }
      }

      // Upload new images to ImageKit
      const newImages: Array<{ url: string; fileId: string }> = [];
      if (watchImages && watchImages.length > 0) {
        for (const imageFile of watchImages) {
          if (imageFile instanceof File) {
            const imagekitResult = await uploadImageToImageKit(imageFile);
            if (imagekitResult) {
              newImages.push(imagekitResult);
            }
          }
        }
      }

      const finalData = {
        ...data,
        bio: sanitizeHtmlField(data.bio),
        qualification: sanitizeHtmlField(data.qualification),
        specialty: sanitizeHtmlField(data.specialty),
        images: null,
      };

      // Update doctor information
      const { data: updatedDoctor, error: updateError } = await supabase
        .from('clinic_doctors')
        .update({
          // GENERAL
          name: finalData.name,
          bio: finalData.bio,
          slug: finalData.slug,
          specialty: finalData.specialty,
          status: finalData.status,
          qualification: finalData.qualification,
          images: finalData.images || currentImages,
          featured_video: finalData.featured_video,
          is_active: finalData.is_active,
          is_featured: finalData.is_featured,
          // selectedClinics: finalData.selectedClinics,
        })
        .eq('id', doctor.id)
        .select()
        .single();

      if (updateError) {
        throw updateError;
      }

      // Insert new images into clinic_images table if we have any
      if (newImages.length > 0 && updatedDoctor) {
        const clinicDoctorImageRecords = newImages.map((image) => ({
          doctor_id: updatedDoctor.id,
          image_url: image.url,
          imagekit_file_id: image.fileId,
        }));

        const { data: insertedImages, error: imageInsertError } = await supabase
          .from('clinic_doctor_images')
          .insert(clinicDoctorImageRecords)
          .select();

        if (imageInsertError) {
          console.error('Error inserting clinic doctor images:', imageInsertError);
          // Don't throw error here as the clinic was updated successfully
          // Just log the error and continue
        } else if (insertedImages) {
          // Update current images state with new images
          setCurrentImages((prev) => [
            ...prev.filter((img) => !imagesToRemove.includes(img.imagekit_file_id)),
            ...insertedImages,
          ]);
        }
      }

      // Delete existing clinic doctor relations
      const { error: deleteClinicDoctorRelationsError } = await supabase
        .from('clinic_doctor_relations')
        .delete()
        .eq('doctor_id', doctor.id);

      if (deleteClinicDoctorRelationsError) {
        throw deleteClinicDoctorRelationsError;
      }

      // Insert new clinic doctor relations
      const { error: insertClinicDoctorRelationsError } = await supabase
        .from('clinic_doctor_relations')
        .insert(
          finalData.selectedClinics.map((clinic) => ({
            doctor_id: doctor.id,
            clinic_id: clinic.clinic_id,
          })),
        );

      if (insertClinicDoctorRelationsError) {
        throw insertClinicDoctorRelationsError;
      }

      if (updatedDoctor) {
        // Get the updated doctor's clinics from the database
        const { data: updatedSelectedClinicsData } = await supabase
          .from('clinic_doctor_relations')
          .select('clinic:clinics(id, slug)')
          .eq('doctor_id', doctor.id);

        // Map the clinics back to the clinic format
        const updatedSelectedClinics =
          updatedSelectedClinicsData?.map((c) => ({
            clinic_id: (c as unknown as { clinic: { id: string; slug: string } }).clinic.id,
            clinic_slug: (c as unknown as { clinic: { id: string; slug: string } }).clinic.slug,
          })) || [];

        // Update the form with the new data
        reset({
          name: updatedDoctor.name || '',
          slug: updatedDoctor.slug || '',
          bio: updatedDoctor.bio || '',
          specialty: updatedDoctor.specialty || '',
          qualification: updatedDoctor.qualification || '',
          status: updatedDoctor.status || '',
          images: [],
          featured_video: updatedDoctor.featured_video || '',
          is_active: updatedDoctor.is_active || false,
          is_featured: updatedDoctor.is_featured || false,
          selectedClinics: updatedSelectedClinics || [],
          // clinics: updatedClinics || [],
        });

        // Update the current images state
        setCurrentImages(updatedDoctor.images || []);
      }

      toast({
        title: 'Success',
        description: 'Doctor updated successfully',
      });

      setImagesToRemove([]);
      router.refresh();
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to update doctor';
      console.error('Error updating doctor:', errorMessage);
      toast({
        title: 'Error',
        description: errorMessage,
        variant: 'destructive',
      });
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} aria-label="Doctor edit form">
        <div className="space-y-6 divide-y divide-gray-200 overflow-hidden">
          <div className="space-y-6 bg-white">
            <div>
              <h3 className="text-lg font-medium leading-6 text-gray-900">Profile</h3>
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
                          placeholder="Enter doctor name"
                          aria-describedby="name-description"
                          {...field}
                        />
                      </FormControl>
                      <FormDescription id="name-description">
                        This is the name that will be displayed on the doctor profile.
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className="col-span-6 sm:col-span-3"></div>

              <div className="col-span-6">
                <FormField
                  control={form.control}
                  name="bio"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="block">Bio</FormLabel>
                      <FormControl>
                        <Textarea
                          advanced
                          placeholder="Type the doctor bio here."
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
                  name="qualification"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="block">Qualification</FormLabel>
                      <FormControl>
                        <Textarea
                          advanced
                          placeholder="Type the doctor qualification here."
                          rows={5}
                          {...field}
                        />
                      </FormControl>
                      <FormDescription>
                        Enter the doctor&apos;s qualifications and certifications.
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className="col-span-6 sm:col-span-5">
                <FormField
                  control={form.control}
                  name="featured_video"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="block">Featured Video</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="https://www.youtube.com/watch?v=dQw4w9WgXcQ"
                          {...field}
                        />
                      </FormControl>
                      <FormDescription>This is the url for the featured video.</FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className="col-span-6 sm:col-span-5">
                <FormField
                  control={form.control}
                  name="slug"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="block">Slug</FormLabel>
                      <FormControl>
                        <Input placeholder="url-slug" prefix="person" {...field} />
                      </FormControl>
                      <FormDescription>This is the url for the doctor profile.</FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className="col-span-6">
                <FormField
                  control={form.control}
                  name="specialty"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="block">Specialty</FormLabel>
                      <FormControl>
                        <Textarea
                          advanced
                          placeholder="Type the specialty here."
                          rows={10}
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              {currentImages.length > 0 && (
                <div className="col-span-6">
                  <h3>Current Images</h3>
                  {renderImages(currentImages, true)}
                </div>
              )}
              <div className="col-span-6">
                <FormField
                  control={form.control}
                  name="images"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Images</FormLabel>
                      <FormControl>
                        <FileInput
                          id="images"
                          {...field}
                          value=""
                          onChange={(e) => {
                            handleImagesChange(e);
                          }}
                        />
                      </FormControl>
                      <FormDescription>Upload images for the doctor</FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                {watchImages && renderImages(watchImages)}
              </div>
            </div>
          </div>

          <div className="space-y-6 bg-white">
            <div className="mt-4">
              <h3 className="text-lg font-medium leading-6 text-gray-900">Listing Feature</h3>
              <p className="mt-1 text-sm text-gray-500">Listing related fields</p>
            </div>

            <div className="grid grid-cols-6 gap-6">
              <div className="col-span-6">
                <FormField
                  control={form.control}
                  name="selectedClinics"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="block">Clinics</FormLabel>
                      <Popover>
                        <PopoverTrigger asChild>
                          <FormControl>
                            <Button
                              variant="outline"
                              type="button"
                              className={cn(
                                'w-full justify-between',
                                !field.value?.length && 'text-gray-500',
                              )}>
                              {field.value?.length
                                ? `${field.value.length} clinic${field.value.length === 1 ? '' : 's'} selected`
                                : 'Select clinics'}
                              <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                            </Button>
                          </FormControl>
                        </PopoverTrigger>
                        <PopoverContent className="w-full p-0">
                          <Command>
                            <CommandInput placeholder="Search clinics..." />
                            <CommandEmpty>No clinic found.</CommandEmpty>
                            <CommandGroup className="max-h-[250px] overflow-auto">
                              {clinics.map((clinic) => (
                                <CommandItem
                                  value={clinic.slug}
                                  key={clinic.id}
                                  onSelect={() => {
                                    const clinicSlug = clinic.slug;
                                    const clinicId = clinic.id;
                                    const newValue = field.value?.some(
                                      (item) => item.clinic_id === clinicId,
                                    )
                                      ? field.value.filter((item) => item.clinic_id !== clinicId)
                                      : [
                                          ...(field.value || []),
                                          { clinic_id: clinicId, clinic_slug: clinicSlug },
                                        ];
                                    field.onChange(newValue);
                                  }}>
                                  <CheckIcon
                                    className={cn(
                                      'mr-2 h-4 w-4',
                                      field.value?.some((item) => item.clinic_id === clinic.id)
                                        ? 'opacity-100'
                                        : 'opacity-0',
                                    )}
                                  />
                                  {clinic.name}
                                </CommandItem>
                              ))}
                            </CommandGroup>
                          </Command>
                        </PopoverContent>
                      </Popover>
                      <FormDescription>Select the clinics where this doctor works.</FormDescription>
                      {field.value?.length > 0 && (
                        <div className="mt-3">
                          <div className="mb-2 text-sm font-medium text-gray-700">
                            Selected Clinics:
                          </div>
                          <div className="flex flex-wrap gap-2">
                            {field.value.map((selectedClinic) => {
                              const clinic = clinics.find((c) => c.id === selectedClinic.clinic_id);
                              return (
                                <div
                                  key={selectedClinic.clinic_id}
                                  className="flex items-center gap-1 rounded-full bg-gray-100 px-3 py-1 text-sm">
                                  <span>{clinic?.name}</span>
                                  <Button
                                    type="button"
                                    variant="ghost"
                                    className="h-auto p-1 hover:bg-gray-200"
                                    onClick={() => {
                                      field.onChange(
                                        field.value.filter(
                                          (selectedClinic) =>
                                            selectedClinic.clinic_id !== clinic?.id,
                                        ),
                                      );
                                    }}>
                                    <XIcon className="h-3 w-3" />
                                    <span className="sr-only">Remove {clinic?.name}</span>
                                  </Button>
                                </div>
                              );
                            })}
                          </div>
                        </div>
                      )}

                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className="col-span-6">
                <FormField
                  control={form.control}
                  name="is_featured"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                      <div className="space-y-0.5">
                        <FormLabel>Featured Listing</FormLabel>
                        <FormDescription>Set this place as featured listing</FormDescription>
                      </div>
                      <FormControl>
                        <Switch checked={field.value} onCheckedChange={field.onChange} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className="col-span-6">
                <FormField
                  control={form.control}
                  name="is_active"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                      <div className="space-y-0.5">
                        <FormLabel>Activate account</FormLabel>
                        <FormDescription>Turn this on to activate the listing</FormDescription>
                      </div>
                      <FormControl>
                        <Switch checked={field.value} onCheckedChange={field.onChange} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className="col-span-6">
                <FormField
                  control={form.control}
                  name="status"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>status</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select a status" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {STATUS_OPTIONS.map((status) => (
                            <SelectItem value={status.value} key={status.value}>
                              {status.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormDescription>Choose a status for the doctor.</FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </div>
          </div>
        </div>
        <div className="col-span-6 mt-6 flex justify-between space-x-4">
          <Link href="/dashboard/doctors">Back</Link>
          <Button type="submit" disabled={isSubmitting} className="flex items-center space-x-2">
            {isSubmitting ? (
              <>
                <RefreshCwIcon className="h-4 w-4 animate-spin" />
                <span>Updating...</span>
              </>
            ) : (
              <span>Update Doctor Profile</span>
            )}
          </Button>
        </div>
      </form>
    </Form>
  );
}
