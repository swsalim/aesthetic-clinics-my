'use client';

import React, { useState } from 'react';
import { useDropzone } from 'react-dropzone';
import { useForm } from 'react-hook-form';

import Link from 'next/link';

// Removed CloudinaryService import - now using ImageKit
import type { ClinicArea, ClinicState } from '@/types/clinic';
import { zodResolver } from '@hookform/resolvers/zod';
import { Loader2 } from 'lucide-react';
import * as z from 'zod';

import { generateUniqueFilename } from '@/lib/utils';
import {
  createNewImageEntries,
  uploadOrderedNewImages,
  type ClinicImageEntry,
} from '@/lib/clinic-images';

import { ClinicImageGallery } from '@/components/dashboard/clinic-image-gallery';
import { Input } from '@/components/form-fields/input';
import { RadioGroup, RadioGroupItem } from '@/components/form-fields/radio';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/form-fields/select';
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
import { useToast } from '@/components/ui/use-toast';

const schema = z.object({
  name: z.string().min(2, 'Your name is required'),
  email: z.string().email(),
  clinic_name: z.string().min(2, 'Clinic name is required'),
  description: z.string().min(10, 'Description is required'),
  state_id: z.string().min(1, 'State is required'),
  area_id: z.string().min(1, 'Area is required'),
  address: z.string().min(2, 'Address is required'),
  phone: z.string().min(2, 'Telephone is required'),
  postal_code: z.string().min(2, 'Postal code is required'),
  clinic_email: z.string().email().optional().or(z.literal('')),
  images: z.any().optional(),
  youtube_url: z.string().url().optional().or(z.literal('')),
  facebook_url: z.string().url().optional().or(z.literal('')),
  instagram_url: z.string().url().optional().or(z.literal('')),
  featured_video: z.string().url().optional().or(z.literal('')),
  price: z.enum(['instant', 'free']),
  honeypot: z.string().max(0, { message: 'This field should be empty' }),
});

type FormData = z.infer<typeof schema>;

type Props = {
  states: ClinicState[];
  areas: ClinicArea[];
};

// const dummyDefaultValues: FormData = {
//   name: 'John Wick',
//   email: 'johnwick@gmail.com',
//   clinic_name: 'All are welcome',
//   description: 'everyone is welcome',
//   state_id: 'd2c57d0e-5be9-4468-94d9-0b621145917b',
//   area_id: 'b5e73513-cc86-48a7-803b-45609498f0aa',
//   address: 'No 435,Block, 11, Jalan Stutong',
//   phone: '+60127758150',
//   postal_code: '93350',
//   clinic_email: 'tiewdentalcentre@gmail.com',
//   images: [],
//   youtube_url: 'https://www.youtube.com/watch?v=A38Kx6LxZ2c',
//   facebook_url: 'https://www.youtube.com/watch?v=face',
//   instagram_url: 'https://www.youtube.com/watch?v=insta',
//   featured_video: 'https://www.youtube.com/watch?v=featured',
//   price: 'free',
// };

export default function SubmitClinicForm({ states, areas }: Props) {
  const { toast } = useToast();
  const [success, setSuccess] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [selectedState, setSelectedState] = useState<string>('');
  const [orderedImages, setOrderedImages] = useState<ClinicImageEntry[]>([]);

  const form = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: {
      name: '',
      email: '',
      clinic_name: '',
      description: '',
      state_id: '',
      area_id: '',
      address: '',
      phone: '',
      postal_code: '',
      clinic_email: '',
      images: [],
      youtube_url: '',
      facebook_url: '',
      instagram_url: '',
      featured_video: '',
      price: 'free',
      honeypot: '',
    },
    // defaultValues: dummyDefaultValues,
    mode: 'onChange',
  });

  const watchStateId = form.watch('state_id');

  // Filter areas by selected state
  const filteredAreas = areas.filter((a) => a.state_id === (watchStateId || selectedState));

  const isDuplicateFile = (file: File, existingFiles: File[]) =>
    existingFiles.some(
      (existing) =>
        existing.name === file.name &&
        existing.size === file.size &&
        existing.type === file.type,
    );

  const handleDrop = (acceptedFiles: File[]) => {
    const validFiles = acceptedFiles.filter(
      (file) => file.size > 0 && file.type.startsWith('image/') && file.name && file.name.includes('.'),
    );
    const currentFiles = orderedImages
      .filter((entry): entry is Extract<ClinicImageEntry, { kind: 'new' }> => entry.kind === 'new')
      .map((entry) => entry.file);

    let newFiles = validFiles.filter((file) => !isDuplicateFile(file, currentFiles));

    if (orderedImages.length + newFiles.length > 5) {
      toast({
        title: 'Image Limit',
        description: 'You can only upload up to 5 images.',
        variant: 'destructive',
      });
      newFiles = newFiles.slice(0, 5 - orderedImages.length);
    }

    if (newFiles.length > 0) {
      setOrderedImages((prev) => [...prev, ...createNewImageEntries(newFiles)]);
    }
  };

  // Upload image to ImageKit
  const uploadImageToImageKit = async (
    imageFile: File,
  ): Promise<{ url: string; fileId: string } | null> => {
    try {
      // Validate file size (max 2MB)
      const maxSize = 2 * 1024 * 1024; // 2MB
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

  const dropzone = useDropzone({
    onDrop: handleDrop,
    accept: {
      'image/jpeg': ['.jpg', '.jpeg'],
      'image/png': ['.png'],
    },
    maxFiles: 5,
    maxSize: 2 * 1024 * 1024, // 2MB in bytes
    onDropRejected: (fileRejections) => {
      fileRejections.forEach((rejection) => {
        if (rejection.errors[0].code === 'file-too-large') {
          toast({
            title: 'File too large',
            description: 'File size must be less than 2MB',
            variant: 'destructive',
          });
        } else if (rejection.errors[0].code === 'file-invalid-type') {
          toast({
            title: 'Invalid file type',
            description: 'Only JPG, JPEG and PNG files are allowed',
            variant: 'destructive',
          });
        }
      });
    },
  });

  const onSubmit = async (formData: FormData) => {
    // Check honeypot field - if it's filled, it's likely a bot
    if (formData.honeypot) {
      console.log('Honeypot detected, ignoring submission');
      // Still pretend to submit the form to not alert the bot
      setTimeout(() => {
        form.reset();
        setSubmitting(false);
      }, 2000);
      return;
    }

    setSubmitting(true);

    // Show loading toast
    toast({
      title: 'Processing...',
      description: 'Please wait while we process your submission.',
    });
    try {
      // Shared step: upload images to ImageKit in the user's chosen order.
      // The returned array preserves display_order (index + 1) when saved to clinic_images.
      const newImages = await uploadOrderedNewImages(orderedImages, uploadImageToImageKit);

      if (formData.price === 'instant') {
        // Instant listing (paid) workflow:
        // 1. POST to /api/stripe/checkout-session
        // 2. API creates clinic with status "pending_payment" and source "ugc_paid"
        // 3. API inserts images into clinic_images with display_order
        // 4. API creates a Stripe checkout session (RM199) linked to the clinic
        // 5. User is redirected to Stripe; listing goes live after successful payment
        const finalData = {
          ...formData,
          images: newImages,
        };

        const res = await fetch('/api/stripe/checkout-session', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(finalData),
        });
        if (!res.ok) {
          const err = await res.json();
          throw new Error(err.error || 'Failed to create Stripe session');
        }
        const { checkoutUrl } = await res.json();
        window.location.href = checkoutUrl;
        return;
      } else {
        // Free listing workflow:
        // 1. POST to /api/clinics
        // 2. API geocodes the address and creates clinic with status "pending" and source "ugc_free"
        // 3. API inserts images into clinic_images with display_order
        // 4. API sends a notification email to admins
        // 5. User sees success message; listing is reviewed and published within ~6 months
        const finalData = {
          ...formData,
          images: newImages,
        };

        const res = await fetch('/api/clinics', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(finalData),
        });
        if (!res.ok) {
          const err = await res.json();
          throw new Error(err.error || 'Failed to submit clinic');
        }
        setSuccess(true);
        toast({ title: 'Success', description: 'Your clinic has been submitted!' });
        form.reset();
        setOrderedImages([]);
      }
    } catch (error: unknown) {
      let message = 'Failed to submit clinic. Please try again later.';
      if (typeof error === 'object' && error && 'message' in error) {
        message = (error as { message?: string }).message || message;
      }
      toast({
        title: 'Error',
        description: message,
        variant: 'destructive',
      });
    } finally {
      setSubmitting(false);
    }
  };

  if (success) {
    return (
      <div className="flex flex-col gap-4 rounded-lg bg-gray-50 p-6 text-center text-gray-700 dark:bg-gray-800/50 dark:text-gray-300">
        <h2 className="mb-2 text-2xl font-bold text-gray-900 dark:text-gray-100">Thank you!</h2>
        <p>Your listing submission was successful.</p>
        <p>We will review and get your submission listed in 6 months.</p>
        <p>
          <Link href="/">Return to Home</Link>
        </p>
      </div>
    );
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        {/* Honeypot field - hidden from users but visible to bots */}
        <div className="hidden" aria-hidden="true">
          <FormField
            control={form.control}
            name="honeypot"
            render={({ field }) => (
              <FormItem>
                <FormLabel htmlFor={field.name}>Leave this empty</FormLabel>
                <FormControl>
                  <Input
                    id={field.name}
                    aria-hidden="true"
                    tabIndex={-1}
                    autoComplete="off"
                    {...field}
                  />
                </FormControl>
              </FormItem>
            )}
          />
        </div>
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
          <FormField
            control={form.control}
            name="name"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Your Name*</FormLabel>
                <FormControl>
                  <Input placeholder="Enter your name" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="email"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Your Email*</FormLabel>
                <FormControl>
                  <Input placeholder="Enter your email address" {...field} />
                </FormControl>
                <FormDescription>
                  We&apos;ll use this email to contact you if there&apos;s any issue with your
                  submission.
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
        <FormField
          control={form.control}
          name="clinic_name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Clinic Name*</FormLabel>
              <FormControl>
                <Input placeholder="Enter clinic name" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="description"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Clinic Description*</FormLabel>
              <FormControl>
                <Textarea placeholder="Describe your clinic" rows={5} {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
          <FormField
            control={form.control}
            name="state_id"
            render={({ field }) => (
              <FormItem>
                <FormLabel>State*</FormLabel>
                <Select
                  value={field.value}
                  onValueChange={(val) => {
                    field.onChange(val);
                    setSelectedState(val);
                    form.setValue('area_id', '');
                  }}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select a state" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {states.map((state) => (
                      <SelectItem key={state.id} value={state.id}>
                        {state.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="area_id"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Area*</FormLabel>
                <Select
                  value={field.value}
                  onValueChange={field.onChange}
                  disabled={!watchStateId && !selectedState}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select an area" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {filteredAreas.map((area) => (
                      <SelectItem key={area.id} value={area.id}>
                        {area.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
        <FormField
          control={form.control}
          name="address"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Address*</FormLabel>

              <FormControl>
                <Textarea placeholder="Enter address" rows={5} {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
          <FormField
            control={form.control}
            name="phone"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Telephone*</FormLabel>
                <FormControl>
                  <Input placeholder="Enter telephone number" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="clinic_email"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Email</FormLabel>
                <FormControl>
                  <Input placeholder="Enter clinic email address" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
          <FormField
            control={form.control}
            name="postal_code"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Postal Code*</FormLabel>
                <FormControl>
                  <Input placeholder="Enter postal code" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
        <FormField
          control={form.control}
          name="images"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Images (up to 5)</FormLabel>
              <div
                {...dropzone.getRootProps()}
                className={`cursor-pointer rounded border-2 border-dashed p-4 text-center transition-colors ${
                  dropzone.isDragActive
                    ? 'border-blue-500 bg-blue-50 dark:border-blue-700 dark:bg-blue-900'
                    : 'border-gray-300 bg-white dark:border-gray-700 dark:bg-gray-900'
                }`}>
                <input {...dropzone.getInputProps()} onBlur={field.onBlur} />
                <p className="text-gray-500 dark:text-gray-400">
                  Drag and drop or click to select up to 5 images.
                </p>
              </div>
              <ClinicImageGallery
                images={orderedImages}
                onChange={setOrderedImages}
                onRemoveExisting={() => {}}
              />
              <FormDescription>Drag and drop or select up to 5 images.</FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
          <FormField
            control={form.control}
            name="youtube_url"
            render={({ field }) => (
              <FormItem>
                <FormLabel>YouTube URL</FormLabel>
                <FormControl>
                  <Input placeholder="https://youtube.com/..." {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="facebook_url"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Facebook URL</FormLabel>
                <FormControl>
                  <Input placeholder="https://facebook.com/..." {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
          <FormField
            control={form.control}
            name="instagram_url"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Instagram URL</FormLabel>
                <FormControl>
                  <Input placeholder="https://instagram.com/..." {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="featured_video"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Featured Video</FormLabel>
                <FormControl>
                  <Input placeholder="https://..." {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
        <div>
          <FormField
            control={form.control}
            name="price"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Choose the price</FormLabel>
                <FormMessage />
                <RadioGroup
                  value={field.value}
                  onValueChange={field.onChange}
                  className="flex flex-col gap-2">
                  <FormItem>
                    <FormLabel className="cursor-pointer [&:has([data-state=checked])>div]:border-blue-700 [&:has([data-state=checked])>div]:bg-blue-50 [&:has([data-state=checked])>div]:text-blue-700 dark:[&:has([data-state=checked])>div]:border-gray-700 dark:[&:has([data-state=checked])>div]:bg-gray-800 dark:[&:has([data-state=checked])>div]:text-gray-200">
                      <FormControl>
                        <RadioGroupItem value="instant" className="sr-only" />
                      </FormControl>
                      <div className="flex flex-row items-center gap-2 rounded border p-4 dark:border-gray-700">
                        <div className="basis-4/5">
                          <div className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                            Instant Listing
                          </div>
                          <div className="text-sm text-gray-500 dark:text-gray-400">
                            DoFollow backlink
                          </div>
                        </div>
                        <div className="basis-1/5 text-right">
                          <div className="flex flex-row items-baseline justify-end gap-1">
                            <span className="text-xs font-bold uppercase text-gray-700 dark:text-gray-300">
                              RM
                            </span>
                            <span className="text-3xl font-semibold text-gray-700 dark:text-gray-300">
                              199
                            </span>
                          </div>
                        </div>
                      </div>
                    </FormLabel>
                  </FormItem>
                  <FormItem>
                    <FormLabel className="cursor-pointer [&:has([data-state=checked])>div]:border-blue-700 [&:has([data-state=checked])>div]:bg-blue-50 [&:has([data-state=checked])>div]:text-blue-700 dark:[&:has([data-state=checked])>div]:border-gray-700 dark:[&:has([data-state=checked])>div]:bg-gray-800 dark:[&:has([data-state=checked])>div]:text-gray-200">
                      <FormControl>
                        <RadioGroupItem value="free" className="sr-only" />
                      </FormControl>
                      <div className="flex flex-row items-center gap-2 rounded border p-4 dark:border-gray-700">
                        <div className="basis-4/5">
                          <div className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                            Free Listing
                          </div>
                          <div className="text-sm text-gray-500 dark:text-gray-400">
                            Get listed within <strong>6 months</strong> with nofollow link.
                          </div>
                        </div>
                        <div className="basis-1/5 text-right">
                          <div className="flex flex-row items-baseline justify-end gap-1">
                            <span className="text-xs font-bold uppercase text-gray-700 dark:text-gray-300">
                              RM
                            </span>
                            <span className="text-3xl font-semibold text-gray-700 dark:text-gray-300">
                              0
                            </span>
                          </div>
                        </div>
                      </div>
                    </FormLabel>
                  </FormItem>
                </RadioGroup>
              </FormItem>
            )}
          />
        </div>
        <Button type="submit" disabled={submitting} className="w-full">
          {submitting ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Submitting...
            </>
          ) : (
            'Join List'
          )}
        </Button>
      </form>
    </Form>
  );
}
