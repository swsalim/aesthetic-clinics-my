'use client';

import { ChangeEvent, useState } from 'react';
import { useForm } from 'react-hook-form';

import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

import type {
  ClinicArea,
  ClinicHours,
  ClinicImage,
  ClinicService,
  ClinicState,
} from '@/types/clinic';
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
import { Checkbox } from '@/components/form-fields/checkbox';
import { FileInput } from '@/components/form-fields/file';
import { Input } from '@/components/form-fields/input';
import { SelectItem } from '@/components/form-fields/select';
import { SelectContent } from '@/components/form-fields/select';
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

// Business Hours Types
interface BusinessDayData {
  isClosed: boolean;
  shifts: { openTime: string; closeTime: string }[];
}

interface HoursToInsert {
  clinic_id: string;
  day_of_week: number;
  open_time: string | null;
  close_time: string | null;
}
interface BusinessShift {
  openTime: string;
  closeTime: string;
}

interface BusinessDay {
  isClosed: boolean;
  shifts: BusinessShift[];
}

type BusinessHours = {
  [key in
    | 'Monday'
    | 'Tuesday'
    | 'Wednesday'
    | 'Thursday'
    | 'Friday'
    | 'Saturday'
    | 'Sunday']: BusinessDay;
};

const daysOfWeek = [
  'Monday',
  'Tuesday',
  'Wednesday',
  'Thursday',
  'Friday',
  'Saturday',
  'Sunday',
] as const;

const STATUS_OPTIONS = [
  { label: 'Pending', value: 'pending' },
  { label: 'Approved', value: 'approved' },
  { label: 'Rejected', value: 'rejected' },
  { label: 'Suspended', value: 'suspended' },
];

interface AddClinicFormProps {
  states: ClinicState[];
  areas: ClinicArea[];
  services: ClinicService[];
}

const clinicProfileSchema = z.object({
  name: z.string(),
  address: z.string().optional(),
  neighborhood: z.string().optional(),
  city: z.string().optional(),
  postal_code: z.string().optional(),
  slug: z.string(),
  description: z.string().optional(),
  website: z.string().optional(),
  email: z.string().optional(),
  phone: z.string().optional(),
  latitude: z.number(),
  longitude: z.number(),
  location: z.unknown(),
  place_id: z.string(),
  rating: z.number().nullable(),
  review_count: z.number().nullable(),
  is_active: z.boolean(),
  is_featured: z.boolean(),
  is_permanently_closed: z.boolean(),
  open_on_public_holidays: z.boolean(),
  images: z.array(z.any()).optional(),
  source: z.string().optional(),
  facebook_url: z.string().optional(),
  instagram_url: z.string().optional(),
  featured_video: z.string().optional(),
  youtube_url: z.string().optional(),
  area_id: z.string(),
  state_id: z.string(),
  status: z.string(),
  services: z.record(z.string(), z.boolean()),
  businessHours: z.record(
    z.string(),
    z.object({
      isClosed: z.boolean(),
      shifts: z.array(z.object({ openTime: z.string(), closeTime: z.string() })),
    }),
  ),
});

type FormData = z.infer<typeof clinicProfileSchema>;

function mapClinicHoursToBusinessHours(hours: ClinicHours[]): BusinessHours {
  const daysOfWeek = [
    'Monday',
    'Tuesday',
    'Wednesday',
    'Thursday',
    'Friday',
    'Saturday',
    'Sunday',
  ] as const;

  return daysOfWeek.reduce((acc, day, idx) => {
    const dayHours = hours.filter((h) => h.day_of_week === idx);
    if (!dayHours.length) {
      acc[day] = {
        isClosed: false,
        shifts: [{ openTime: '09:00', closeTime: '17:00' }],
      };
    } else if (dayHours.every((h) => !h.open_time || !h.close_time)) {
      acc[day] = {
        isClosed: true,
        shifts: [],
      };
    } else {
      acc[day] = {
        isClosed: false,
        shifts: dayHours
          .filter((h) => h.open_time && h.close_time)
          .map((h) => ({
            openTime: h.open_time as string,
            closeTime: h.close_time as string,
          })),
      };
    }
    return acc;
  }, {} as BusinessHours);
}

export default function FormAddClinic({ services, areas, states }: AddClinicFormProps) {
  const router = useRouter();
  const supabase = createClient();

  const [currentImages, setCurrentImages] = useState<ClinicImage[]>([]);
  const [imagesToRemove, setImagesToRemove] = useState<string[]>([]);

  const handleTimeInput = async (days: readonly string[]) => {
    const shifts: { openTime: string; closeTime: string }[] = [];
    let addMore = true;

    while (addMore) {
      const openTime = prompt('Enter opening time (HH:MM):');
      if (!openTime) break;

      const closeTime = prompt('Enter closing time (HH:MM):');
      if (!closeTime) break;

      // Validate time format
      const timeRegex = /^([01]?[0-9]|2[0-3]):[0-5][0-9]$/;
      if (!timeRegex.test(openTime) || !timeRegex.test(closeTime)) {
        toast({
          variant: 'destructive',
          title: 'Invalid time format',
          description: 'Please use HH:MM format (24-hour)',
        });
        continue;
      }

      shifts.push({ openTime, closeTime });

      // Ask if user wants to add another shift
      addMore = confirm('Do you want to add another shift?');
    }

    if (shifts.length === 0) return;

    // Apply shifts to selected days
    days.forEach((day) => {
      form.setValue(`businessHours.${day}.isClosed`, false);
      form.setValue(`businessHours.${day}.shifts`, shifts);
    });
  };

  // Add this new function to handle adding a shift
  const handleAddShift = (day: string) => {
    const currentShifts = form.getValues(`businessHours.${day}.shifts`) || [];
    form.setValue(`businessHours.${day}.shifts`, [
      ...currentShifts,
      { openTime: '09:00', closeTime: '17:00' },
    ]);
  };

  // Add this new function to handle removing a shift
  const handleRemoveShift = (day: string, index: number) => {
    const currentShifts = form.getValues(`businessHours.${day}.shifts`) || [];
    form.setValue(
      `businessHours.${day}.shifts`,
      currentShifts.filter((_, i) => i !== index),
    );
  };

  // Add this new function to handle closing a day
  const handleCloseDay = (day: string, checked: boolean) => {
    form.setValue(`businessHours.${day}.isClosed`, checked);
    if (checked) {
      form.setValue(`businessHours.${day}.shifts`, []);
    }
  };

  const form = useForm<FormData>({
    resolver: zodResolver(clinicProfileSchema),
    defaultValues: {
      name: '',
      address: '',
      neighborhood: '',
      city: '',
      postal_code: '',
      slug: '',
      description: '',
      website: '',
      email: '',
      phone: '',
      latitude: 0,
      longitude: 0,
      location: '',
      place_id: '',
      rating: 0,
      review_count: 0,
      is_active: false,
      is_featured: false,
      is_permanently_closed: false,
      open_on_public_holidays: false,
      images: [],
      source: 'manual',
      facebook_url: '',
      instagram_url: '',
      featured_video: '',
      youtube_url: '',
      area_id: '',
      state_id: '',
      status: 'pending',
      businessHours: mapClinicHoursToBusinessHours([]),
      services: services.reduce(
        (acc, service) => {
          acc[service.id] = false;
          return acc;
        },
        {} as Record<string, boolean>,
      ),
    },
    mode: 'onChange',
  });

  const { reset } = form;
  const { isSubmitting } = form.formState;
  const watchName = form.watch('name');
  const watchImages = form.watch('images');
  const watchStateId = form.watch('state_id');

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const watchBusinessHours = form.watch('businessHours');
  // console.log('watchBusinessHours', watchBusinessHours);

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
      formData.append('folder', 'aesthetic-clinics-my/places');
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
            `https://ik.imagekit.io/yuurrific/aesthetic-clinics-my/places/${data.imagekit_file_id}`,
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
              <div className="relative aspect-square overflow-hidden rounded-md shadow-md">
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
    console.log('onSubmit ~ data');
    console.log(data);
    try {
      const location = `POINT(${data.longitude} ${data.latitude})`;
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) throw new Error('User not found');

      for (const imagekitFileId of imagesToRemove) {
        try {
          // Delete from to_be_reviewed_clinic_images table
          const { error: deleteError } = await supabase
            .from('clinic_images')
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
        description: sanitizeHtmlField(data.description),
        images: null,
        location,
      };

      console.log('finalData');
      console.log(finalData);

      // Insert clinic information
      const { data: newClinic, error: updateError } = await supabase
        .from('clinics')
        .insert({
          // GENERAL
          name: finalData.name,
          description: finalData.description,
          slug: finalData.slug,
          website: finalData.website,
          place_id: finalData.place_id,
          // LOCATION RELATED
          area_id: finalData.area_id,
          state_id: finalData.state_id,
          address: finalData.address,
          neighborhood: finalData.neighborhood,
          city: finalData.city,
          postal_code: finalData.postal_code,
          phone: finalData.phone,
          email: finalData.email,
          latitude: finalData.latitude,
          longitude: finalData.longitude,
          location,
          rating: finalData.rating,
          review_count: finalData.review_count,
          // IMAGE RELATED
          images: null, // Set to null since images are stored in clinic_images table
          // SOCIAL RELATED
          facebook_url: finalData.facebook_url,
          instagram_url: finalData.instagram_url,
          youtube_url: finalData.youtube_url,
          featured_video: finalData.featured_video,
          // STATUS RELATED
          is_active: finalData.is_active,
          is_featured: finalData.is_featured,
          is_permanently_closed: finalData.is_permanently_closed,
          open_on_public_holidays: finalData.open_on_public_holidays,
          status: finalData.status,
        })
        .select()
        .single();

      if (updateError) {
        throw updateError;
      }

      // Insert new images into clinic_images table if we have any
      if (newImages.length > 0 && newClinic) {
        const clinicImageRecords = newImages.map((image) => ({
          clinic_id: newClinic.id,
          image_url: image.url,
          imagekit_file_id: image.fileId,
        }));

        const { data: insertedImages, error: imageInsertError } = await supabase
          .from('clinic_images')
          .insert(clinicImageRecords)
          .select();

        if (imageInsertError) {
          console.error('Error inserting clinic images:', imageInsertError);
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

      // Delete existing hours
      const { error: deleteHoursError } = await supabase
        .from('clinic_hours')
        .delete()
        .eq('clinic_id', newClinic.id);

      if (deleteHoursError) {
        throw deleteHoursError;
      }

      // Insert new hours
      const dayMap: Record<string, number> = {
        Monday: 0,
        Tuesday: 1,
        Wednesday: 2,
        Thursday: 3,
        Friday: 4,
        Saturday: 5,
        Sunday: 6,
      };

      const businessHoursEntries = Object.entries(finalData.businessHours) as [
        string,
        BusinessDayData,
      ][];

      // Process closed days
      const closedDaysHours: HoursToInsert[] = businessHoursEntries
        .filter(([, dayData]) => dayData.isClosed)
        .map(([day]) => ({
          clinic_id: newClinic.id,
          day_of_week: dayMap[day],
          open_time: null,
          close_time: null,
        }));

      // Process open days with shifts
      const openDaysHours: HoursToInsert[] = businessHoursEntries
        .filter(([, dayData]) => !dayData.isClosed)
        .flatMap(([day, dayData]) =>
          dayData.shifts.map((shift) => ({
            clinic_id: newClinic.id,
            day_of_week: dayMap[day],
            open_time: shift.openTime,
            close_time: shift.closeTime,
          })),
        );

      const hoursToInsert = [...closedDaysHours, ...openDaysHours];

      const { error: insertHoursError } = await supabase.from('clinic_hours').insert(hoursToInsert);

      if (insertHoursError) {
        throw insertHoursError;
      }

      // Delete existing services
      const { error: deleteServicesError } = await supabase
        .from('clinic_service_relations')
        .delete()
        .eq('clinic_id', newClinic.id);

      if (deleteServicesError) {
        throw deleteServicesError;
      }

      // Insert new services
      const servicesToInsert = Object.entries(finalData.services)
        .filter(([, isSelected]) => isSelected)
        .map(([serviceId]) => ({
          clinic_id: newClinic.id,
          service_id: serviceId,
        }));

      const { error: insertServicesError } = await supabase
        .from('clinic_service_relations')
        .insert(servicesToInsert);

      if (insertServicesError) {
        throw insertServicesError;
      }

      if (newClinic) {
        // Get the updated hours from the database
        const { data: updatedHours } = await supabase
          .from('clinic_hours')
          .select('*')
          .eq('clinic_id', newClinic.id);

        // Map the hours back to the businessHours format
        const updatedBusinessHours = daysOfWeek.reduce((acc, day) => {
          const dayHours =
            updatedHours?.filter((h) => h.day_of_week === daysOfWeek.indexOf(day)) || [];

          if (
            dayHours.length === 0 ||
            (dayHours[0].open_time === null && dayHours[0].close_time === null)
          ) {
            acc[day] = {
              isClosed: true,
              shifts: [],
            };
          } else {
            acc[day] = {
              isClosed: false,
              shifts: dayHours.map((h) => ({
                openTime: h.open_time as string,
                closeTime: h.close_time as string,
              })),
            };
          }
          return acc;
        }, {} as BusinessHours);

        // Get the updated services from the database
        const { data: updatedServices } = await supabase
          .from('clinic_service_relations')
          .select('*')
          .eq('clinic_id', newClinic.id);

        const updatedServicesMap = updatedServices?.reduce(
          (acc, service) => {
            acc[service.service_id] = true;
            return acc;
          },
          {} as Record<string, boolean>,
        );

        // Update the form with the new data
        reset({
          name: newClinic.name || '',
          address: newClinic.address || '',
          neighborhood: newClinic.neighborhood || '',
          city: newClinic.city || '',
          postal_code: newClinic.postal_code || '',
          slug: newClinic.slug,
          description: newClinic.description || undefined,
          website: newClinic.website || undefined,
          email: newClinic.email || undefined,
          phone: newClinic.phone || undefined,
          latitude: newClinic.latitude,
          longitude: newClinic.longitude,
          location: newClinic.location,
          place_id: newClinic.place_id,
          rating: newClinic.rating,
          review_count: newClinic.review_count,
          is_active: newClinic.is_active,
          is_featured: newClinic.is_featured,
          is_permanently_closed: newClinic.is_permanently_closed,
          open_on_public_holidays: newClinic.open_on_public_holidays,
          images: [],
          source: newClinic.source || '',
          facebook_url: newClinic.facebook_url || undefined,
          instagram_url: newClinic.instagram_url || undefined,
          featured_video: newClinic.featured_video || undefined,
          youtube_url: newClinic.youtube_url || undefined,
          area_id: newClinic.area_id,
          state_id: newClinic.state_id,
          status: newClinic.status,
          businessHours: updatedBusinessHours,
          services: updatedServicesMap,
        });

        // Update the current images state
        setCurrentImages(newClinic.images || []);
      }

      toast({
        title: 'Success',
        description: 'Clinic updated successfully',
      });

      setImagesToRemove([]);
      router.push('/dashboard/clinics');
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to update clinic';
      console.error('Error updating clinic:', errorMessage);
      toast({
        title: 'Error',
        description: errorMessage,
        variant: 'destructive',
      });
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} aria-label="Clinic review form">
        <div className="space-y-6 divide-y divide-gray-200 shadow sm:overflow-hidden sm:rounded-md">
          <div className="space-y-6 bg-white px-4 py-6 sm:p-6">
            <div>
              <h3 className="text-lg font-medium leading-6 text-gray-900">Add Clinic</h3>
              <p className="mt-1 text-sm text-gray-500">
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
                          placeholder="Enter clinic name"
                          aria-describedby="name-description"
                          {...field}
                        />
                      </FormControl>
                      <FormDescription id="name-description">
                        This is the name that will be displayed on the business profile.
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className="col-span-6 sm:col-span-3"></div>

              <div className="col-span-6 sm:col-span-5">
                <FormField
                  control={form.control}
                  name="slug"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="block">Slug</FormLabel>
                      <FormControl>
                        <Input placeholder="url-slug" prefix="place" {...field} />
                      </FormControl>
                      <FormDescription>This is the url for the business profile.</FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className="col-span-6 sm:col-span-3">
                <FormField
                  control={form.control}
                  name="state_id"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>State</FormLabel>
                      <Popover>
                        <PopoverTrigger asChild>
                          <FormControl>
                            <Button
                              variant="outline"
                              role="combobox"
                              aria-expanded={false}
                              aria-label="Select a town"
                              className={cn(
                                'w-full justify-between',
                                !field.value && 'text-gray-500',
                              )}>
                              {field.value
                                ? states.find((state) => state.id === field.value)?.name
                                : 'Select a state'}
                              <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                            </Button>
                          </FormControl>
                        </PopoverTrigger>
                        <PopoverContent className="w-full p-0">
                          <Command>
                            <CommandInput placeholder="Search state..." />
                            <CommandEmpty>No state found.</CommandEmpty>
                            <CommandGroup className="max-h-[300px] overflow-auto">
                              {states.map((state) => (
                                <CommandItem
                                  key={state.id}
                                  value={state.name}
                                  onSelect={() => {
                                    field.onChange(state.id);
                                  }}>
                                  <CheckIcon
                                    className={cn(
                                      'mr-2 h-4 w-4',
                                      state.id === field.value ? 'opacity-100' : 'opacity-0',
                                    )}
                                  />
                                  {state.name}
                                </CommandItem>
                              ))}
                            </CommandGroup>
                          </Command>
                        </PopoverContent>
                      </Popover>
                      <FormDescription>
                        Select a town location where the business is located.
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className="col-span-6 sm:col-span-3">
                <FormField
                  control={form.control}
                  name="area_id"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Area</FormLabel>
                      <Popover>
                        <PopoverTrigger asChild>
                          <FormControl>
                            <Button
                              variant="outline"
                              role="combobox"
                              aria-expanded={false}
                              aria-label="Select a town"
                              className={cn(
                                'w-full justify-between',
                                !field.value && 'text-gray-500',
                              )}>
                              {field.value
                                ? areas.find((area) => area.id === field.value)?.name
                                : 'Select an area'}
                              <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                            </Button>
                          </FormControl>
                        </PopoverTrigger>
                        <PopoverContent className="w-full p-0">
                          <Command>
                            <CommandInput placeholder="Search area..." />
                            <CommandEmpty>No area found.</CommandEmpty>
                            <CommandGroup className="max-h-[300px] overflow-auto">
                              {areas
                                .filter((area) => !watchStateId || area.state_id === watchStateId)
                                .map((area) => (
                                  <CommandItem
                                    key={area.id}
                                    value={area.name}
                                    onSelect={() => {
                                      field.onChange(area.id);
                                    }}>
                                    <CheckIcon
                                      className={cn(
                                        'mr-2 h-4 w-4',
                                        area.id === field.value ? 'opacity-100' : 'opacity-0',
                                      )}
                                    />
                                    {area.name}
                                  </CommandItem>
                                ))}
                            </CommandGroup>
                          </Command>
                        </PopoverContent>
                      </Popover>
                      <FormDescription>
                        Select a town location where the business is located.
                      </FormDescription>
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
                          // onChange={field.onChange}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className="col-span-6 sm:col-span-5">
                <FormField
                  control={form.control}
                  name="website"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="block">Website URL</FormLabel>
                      <FormControl>
                        <Input placeholder="https://www.clinicgeek.com" {...field} />
                      </FormControl>
                      <FormDescription>This is the business&apos; website URL.</FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className="col-span-6">
                <FormField
                  control={form.control}
                  name="services"
                  render={() => (
                    <FormItem>
                      <FormLabel className="block">Clinic Services</FormLabel>
                      <FormDescription>Select services provided.</FormDescription>
                      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
                        {services.map((service) => (
                          <FormField
                            key={service.id}
                            control={form.control}
                            name={`services.${service.id}`}
                            render={({ field }) => (
                              <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
                                <FormControl>
                                  <Switch checked={field.value} onCheckedChange={field.onChange} />
                                </FormControl>
                                <div className="space-y-1 leading-none">
                                  <FormLabel>{service.name}</FormLabel>
                                  {service.description && (
                                    <FormDescription>{service.description}</FormDescription>
                                  )}
                                </div>
                              </FormItem>
                            )}
                          />
                        ))}
                      </div>
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
                      <FormDescription>Upload images for the clinic</FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                {watchImages && watchImages.length > 0 && renderImages(watchImages)}
              </div>
            </div>
          </div>

          <div className="space-y-6 bg-white px-4 py-6 sm:p-6">
            <div>
              <h3 className="text-lg font-medium leading-6 text-gray-900">Location Information</h3>
              <p className="mt-1 text-sm text-gray-500">Information related fields</p>
            </div>
            <div className="grid grid-cols-6 gap-6">
              <div className="col-span-6">
                <h3 className="mb-2 text-base font-medium leading-6 text-gray-900">
                  Business Hours
                </h3>
                <div className="space-y-4">
                  <div className="flex flex-wrap gap-2">
                    <Button
                      type="button"
                      variant="outline"
                      size="default"
                      onClick={() => handleTimeInput(daysOfWeek)}>
                      Edit All Hours
                    </Button>
                    <Button
                      type="button"
                      variant="outline"
                      size="default"
                      onClick={() =>
                        handleTimeInput(['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'])
                      }>
                      Edit Weekdays (Mon-Fri)
                    </Button>
                    <Button
                      type="button"
                      variant="outline"
                      size="default"
                      onClick={() => handleTimeInput(['Saturday', 'Sunday'])}>
                      Edit Weekends (Sat-Sun)
                    </Button>
                  </div>

                  <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                    {daysOfWeek.map((day) => (
                      <div key={day} className="rounded-md border p-4">
                        <div className="mb-2 flex items-center justify-between">
                          <h4 className="font-medium">{day}</h4>
                          <div className="flex items-center gap-2">
                            <FormField
                              control={form.control}
                              name={`businessHours.${day}.isClosed`}
                              render={({ field }) => (
                                <FormItem className="flex items-center space-x-2 space-y-0">
                                  <FormControl>
                                    <Checkbox
                                      checked={field.value}
                                      onCheckedChange={(checked) => handleCloseDay(day, !!checked)}
                                    />
                                  </FormControl>
                                  <FormLabel className="text-sm font-normal">Closed</FormLabel>
                                </FormItem>
                              )}
                            />
                            <Button
                              type="button"
                              variant="ghost"
                              size="default"
                              onClick={() => handleAddShift(day)}
                              disabled={form.getValues(`businessHours.${day}.isClosed`)}>
                              + Add Shift
                            </Button>
                          </div>
                        </div>
                        {!form.getValues(`businessHours.${day}.isClosed`) && (
                          <div className="space-y-2">
                            {(form.getValues(`businessHours.${day}.shifts`) || []).map(
                              (shift, index) => (
                                <div key={index} className="flex items-center gap-2">
                                  <div className="grid flex-1 grid-cols-2 gap-2">
                                    <FormField
                                      control={form.control}
                                      name={`businessHours.${day}.shifts.${index}.openTime`}
                                      render={({ field }) => (
                                        <Input
                                          type="time"
                                          value={field.value}
                                          onChange={(e) =>
                                            form.setValue(
                                              `businessHours.${day}.shifts.${index}.openTime`,
                                              e.target.value,
                                            )
                                          }
                                          disabled={form.getValues(`businessHours.${day}.isClosed`)}
                                        />
                                      )}
                                    />
                                    <FormField
                                      control={form.control}
                                      name={`businessHours.${day}.shifts.${index}.closeTime`}
                                      render={({ field }) => (
                                        <Input
                                          type="time"
                                          value={field.value}
                                          onChange={(e) =>
                                            form.setValue(
                                              `businessHours.${day}.shifts.${index}.closeTime`,
                                              e.target.value,
                                            )
                                          }
                                          disabled={form.getValues(`businessHours.${day}.isClosed`)}
                                        />
                                      )}
                                    />
                                  </div>
                                  {(form.getValues(`businessHours.${day}.shifts`) || []).length >
                                    1 && (
                                    <Button
                                      type="button"
                                      variant="ghost"
                                      size="default"
                                      onClick={() => handleRemoveShift(day, index)}>
                                      <XIcon className="h-4 w-4" />
                                    </Button>
                                  )}
                                </div>
                              ),
                            )}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              <div className="col-span-6">
                <FormField
                  control={form.control}
                  name="open_on_public_holidays"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                      <div className="space-y-0.5">
                        <FormLabel>This place opens on public holiday</FormLabel>
                        <FormDescription>Does this place open on public holiday?</FormDescription>
                      </div>
                      <FormControl>
                        <Switch checked={field.value} onCheckedChange={field.onChange} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className="col-span-6 sm:col-span-4">
                <FormField
                  control={form.control}
                  name="address"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Address</FormLabel>
                      <FormControl>
                        <Input placeholder="123 Avenue Street" {...field} />
                      </FormControl>
                      <FormDescription>
                        This is the address that will be displayed on the business profile.
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className="col-span-6 sm:col-span-3">
                <FormField
                  control={form.control}
                  name="neighborhood"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Neighborhood</FormLabel>
                      <FormControl>
                        <Input placeholder="Kuala Lumpur" {...field} />
                      </FormControl>
                    </FormItem>
                  )}
                />
              </div>

              <div className="col-span-6 sm:col-span-3">
                <FormField
                  control={form.control}
                  name="postal_code"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Postal Code</FormLabel>
                      <FormControl>
                        <Input placeholder="12345" {...field} />
                      </FormControl>
                    </FormItem>
                  )}
                />
              </div>

              <div className="col-span-6 sm:col-span-3">
                <FormField
                  control={form.control}
                  name="latitude"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Latitude</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          placeholder="1.3415199"
                          value={field.value ?? ''}
                          onChange={(e) => {
                            field.onChange(
                              e.target.value === '' ? undefined : Number(e.target.value),
                            );
                          }}
                        />
                      </FormControl>
                      <div className="mt-2 text-sm text-gray-500">
                        Click{' '}
                        <Link
                          className="font-medium text-blue-600"
                          href={`https://www.google.com/maps/place/${watchName.split(' ').join('+')}`}
                          target="_blank">
                          here
                        </Link>{' '}
                        to check for latitude and longitude
                      </div>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className="col-span-6 sm:col-span-3">
                <FormField
                  control={form.control}
                  name="longitude"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Longitude</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          placeholder="103.6882118"
                          value={field.value ?? ''}
                          onChange={(e) => {
                            field.onChange(
                              e.target.value === '' ? undefined : Number(e.target.value),
                            );
                          }}
                        />
                      </FormControl>
                      <div className="mt-2 text-sm text-gray-500">
                        Click{' '}
                        <Link
                          className="font-medium text-blue-600"
                          href={`https://www.google.com/maps/place/${watchName.split(' ').join('+')}`}
                          target="_blank">
                          here
                        </Link>{' '}
                        to check for latitude and longitude
                      </div>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className="col-span-6 sm:col-span-3">
                <FormField
                  control={form.control}
                  name="phone"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Phone Number</FormLabel>
                      <FormControl>
                        <Input placeholder="6861 1182" {...field} />
                      </FormControl>
                      <FormDescription>
                        This is the phone number that will be displayed on the business profile.
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className="col-span-6 sm:col-span-3">
                <FormField
                  control={form.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Business Email Address</FormLabel>
                      <FormControl>
                        <Input placeholder="business_name@gmail.com" {...field} />
                      </FormControl>
                      <FormDescription>
                        This is the email address that will be displayed on the business profile.
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className="col-span-6">
                <FormField
                  control={form.control}
                  name="is_permanently_closed"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                      <div className="space-y-0.5">
                        <FormLabel>This place has closed down</FormLabel>
                        <FormDescription>Has the business closed down permanently?</FormDescription>
                      </div>
                      <FormControl>
                        <Switch checked={field.value} onCheckedChange={field.onChange} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </div>
          </div>

          <div className="space-y-6 bg-white px-4 py-6 sm:p-6">
            <div>
              <h3 className="text-lg font-medium leading-6 text-gray-900">Social Info</h3>
              <p className="mt-1 text-sm text-gray-500">Social related fields</p>
            </div>

            <div className="grid grid-cols-6 gap-6">
              <div className="col-span-6 sm:col-span-3">
                <FormField
                  control={form.control}
                  name="rating"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Google Rating</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          placeholder="5.0"
                          value={field.value ?? ''}
                          onChange={(e) =>
                            field.onChange(
                              e.target.value === '' ? undefined : Number(e.target.value),
                            )
                          }
                        />
                      </FormControl>
                      <FormDescription>
                        This is the rating that will be displayed on the business profile.
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              <div className="col-span-6 sm:col-span-3">
                <FormField
                  control={form.control}
                  name="review_count"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Number of Ratings</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          placeholder="5"
                          value={field.value ?? ''}
                          onChange={(e) =>
                            field.onChange(
                              e.target.value === '' ? undefined : Number(e.target.value),
                            )
                          }
                        />
                      </FormControl>
                      <FormDescription>
                        This is the total rating count that will be displayed on the business
                        profile.
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              <div className="col-span-6 sm:col-span-3">
                <FormField
                  control={form.control}
                  name="facebook_url"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Facebook</FormLabel>
                      <FormControl>
                        <Input {...field} />
                      </FormControl>
                      <FormDescription>
                        This is the Facebook URL that will be displayed on the business profile.
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              <div className="col-span-6 sm:col-span-3">
                <FormField
                  control={form.control}
                  name="instagram_url"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Instagram</FormLabel>
                      <FormControl>
                        <Input {...field} />
                      </FormControl>
                      <FormDescription>
                        This is the Instagram URL that will be displayed on the business profile.
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              <div className="col-span-6 sm:col-span-3">
                <FormField
                  control={form.control}
                  name="youtube_url"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Youtube</FormLabel>
                      <FormControl>
                        <Input {...field} />
                      </FormControl>
                      <FormDescription>
                        This is the Youtube URL that will be displayed on the business profile.
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              <div className="col-span-6 sm:col-span-3">
                <FormField
                  control={form.control}
                  name="featured_video"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Featured Video</FormLabel>
                      <FormControl>
                        <Input {...field} />
                      </FormControl>
                      <FormDescription>
                        This is the video that will be displayed on the business profile.
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </div>
          </div>
          <div className="space-y-6 bg-white px-4 py-6 sm:p-6">
            <div>
              <h3 className="text-lg font-medium leading-6 text-gray-900">Listing Feature</h3>
              <p className="mt-1 text-sm text-gray-500">Listing related fields</p>
            </div>

            <div className="grid grid-cols-6 gap-6">
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
                      <FormDescription>Choose a status for the clinic.</FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </div>
          </div>
        </div>
        <div className="col-span-6 mt-6 flex justify-between space-x-4">
          <Button type="submit" disabled={isSubmitting} className="flex items-center space-x-2">
            {isSubmitting ? (
              <>
                <RefreshCwIcon className="h-4 w-4 animate-spin" />
                <span>Updating...</span>
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
