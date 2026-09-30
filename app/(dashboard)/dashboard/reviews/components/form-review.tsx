'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';

import Link from 'next/link';
import { useRouter } from 'next/navigation';

import { ReviewClinicSummary } from '@/types/clinic';
import { zodResolver } from '@hookform/resolvers/zod';
import { CheckIcon, ChevronsUpDown, RefreshCwIcon, StarIcon, XIcon } from 'lucide-react';
import * as z from 'zod';

import { revalidateClinicReview } from '@/lib/actions/revalidate';
import { createClient } from '@/lib/supabase/client';
import { cn } from '@/lib/utils';

import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
} from '@/components/dashboard/command';
import { Input } from '@/components/form-fields/input';
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
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { toast } from '@/components/ui/use-toast';

const STATUS_OPTIONS = [
  { label: 'Approved', value: 'approved' },
  { label: 'Pending', value: 'pending' },
  { label: 'Rejected', value: 'rejected' },
  { label: 'Clinic deleted', value: 'clinic_deleted' },
  { label: 'Clinic rejected', value: 'clinic_rejected' },
] as const;

const SOURCE_OPTIONS = [
  { label: 'Manual', value: 'manual' },
  { label: 'Imported', value: 'imported' },
  { label: 'Scraped', value: 'scraped' },
  { label: 'API', value: 'api' },
] as const;

const reviewSchema = z.object({
  clinic_id: z.string().min(1, 'Select a clinic'),
  author_name: z.string().trim().min(1, 'Enter the reviewer name').max(100),
  email: z
    .string()
    .trim()
    .refine((value) => value === '' || z.string().email().safeParse(value).success, {
      message: 'Enter a valid email address',
    }),
  text: z.string().trim(),
  rating: z.number().min(1, 'Select a rating').max(5),
  status: z.enum(['approved', 'pending', 'rejected', 'clinic_deleted', 'clinic_rejected']),
  source: z.enum(['manual', 'imported', 'scraped', 'api']),
  review_time: z.string(),
});

type ReviewFormValues = z.infer<typeof reviewSchema>;

export interface ReviewFormReview {
  id: string;
  clinic_id: string;
  author_name: string;
  email: string | null;
  text: string | null;
  rating: number | null;
  status: string | null;
  source: string | null;
  review_time: string | null;
  clinic: { slug: string } | null;
}

interface FormReviewProps {
  clinics: ReviewClinicSummary[];
  review?: ReviewFormReview;
}

function toDateTimeLocal(value: string | null) {
  if (!value) return '';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '';

  const pad = (part: number) => String(part).padStart(2, '0');
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}`;
}

function isStatus(value: string | null): value is ReviewFormValues['status'] {
  return STATUS_OPTIONS.some((option) => option.value === value);
}

function isSource(value: string | null): value is ReviewFormValues['source'] {
  return SOURCE_OPTIONS.some((option) => option.value === value);
}

function ClinicPicker({
  clinics,
  value,
  onChange,
}: {
  clinics: ReviewClinicSummary[];
  value: string;
  onChange: (clinicId: string) => void;
}) {
  const [open, setOpen] = useState(false);
  const selected = clinics.find((clinic) => clinic.id === value);

  return (
    <div>
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            type="button"
            role="combobox"
            aria-expanded={open}
            className={cn('w-full justify-between', !selected && 'text-gray-500')}
          >
            {selected ? selected.name : 'Select a clinic'}
            <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-[28rem] max-w-[calc(100vw-2rem)] p-0" align="start">
          <Command>
            <CommandInput placeholder="Search clinics..." />
            <CommandEmpty>No clinic found.</CommandEmpty>
            <CommandGroup className="max-h-[250px] overflow-auto">
              {clinics.map((clinic) => (
                <CommandItem
                  value={`${clinic.name} ${clinic.slug}`}
                  key={clinic.id}
                  onSelect={() => {
                    onChange(clinic.id);
                    setOpen(false);
                  }}
                >
                  <CheckIcon
                    className={cn(
                      'mr-2 h-4 w-4',
                      value === clinic.id ? 'opacity-100' : 'opacity-0',
                    )}
                  />
                  <span className="truncate">{clinic.name}</span>
                </CommandItem>
              ))}
            </CommandGroup>
          </Command>
        </PopoverContent>
      </Popover>
      {selected && (
        <div className="mt-3 flex flex-wrap gap-2">
          <div className="flex items-center gap-1 rounded-full bg-gray-100 px-3 py-1 text-sm">
            <span>{selected.name}</span>
            <Button
              type="button"
              variant="ghost"
              className="h-auto p-1 hover:bg-gray-200"
              onClick={() => onChange('')}
            >
              <XIcon className="h-3 w-3" />
              <span className="sr-only">Remove {selected.name}</span>
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}

function RatingInput({
  value,
  onChange,
  id,
}: {
  value: number;
  onChange: (value: number) => void;
  id?: string;
}) {
  return (
    <div className="flex space-x-1" id={id}>
      {[1, 2, 3, 4, 5].map((star) => (
        <button
          key={star}
          type="button"
          onClick={() => onChange(star)}
          className="focus:outline-none"
          aria-label={`${star} star${star === 1 ? '' : 's'}`}
        >
          <StarIcon
            className={`h-6 w-6 ${
              star <= value ? 'fill-brand stroke-transparent' : 'fill-gray-200 stroke-gray-200'
            }`}
          />
        </button>
      ))}
    </div>
  );
}

export default function FormReview({ clinics, review }: FormReviewProps) {
  const router = useRouter();
  const supabase = createClient();
  const isEditing = Boolean(review);

  const form = useForm<ReviewFormValues>({
    resolver: zodResolver(reviewSchema),
    defaultValues: {
      clinic_id: review?.clinic_id ?? '',
      author_name: review?.author_name ?? '',
      email: review?.email ?? '',
      text: review?.text ?? '',
      rating: review?.rating && review.rating > 0 ? review.rating : 5,
      status: isStatus(review?.status ?? null)
        ? (review?.status as ReviewFormValues['status'])
        : isEditing
          ? 'pending'
          : 'approved',
      source: isSource(review?.source ?? null)
        ? (review?.source as ReviewFormValues['source'])
        : 'manual',
      review_time: review
        ? toDateTimeLocal(review.review_time)
        : toDateTimeLocal(new Date().toISOString()),
    },
    mode: 'onBlur',
  });

  const { isSubmitting } = form.formState;

  const onSubmit = async (data: ReviewFormValues) => {
    const payload = {
      clinic_id: data.clinic_id,
      author_name: data.author_name.trim(),
      email: data.email.trim() || null,
      text: data.text.trim() || null,
      rating: data.rating,
      status: data.status,
      source: data.source,
      review_time: data.review_time
        ? new Date(data.review_time).toISOString()
        : new Date().toISOString(),
    };

    try {
      const clinicSlug = clinics.find((clinic) => clinic.id === data.clinic_id)?.slug;
      const slugs = [review?.clinic?.slug, clinicSlug].filter((slug): slug is string =>
        Boolean(slug),
      );

      if (review) {
        const { error } = await supabase.from('clinic_reviews').update(payload).eq('id', review.id);
        if (error) throw error;

        await revalidateClinicReview(slugs);
        toast({ title: 'Review updated' });
        router.refresh();
        return;
      }

      const { data: created, error } = await supabase
        .from('clinic_reviews')
        .insert(payload)
        .select('id')
        .single();

      if (error) throw error;

      await revalidateClinicReview(slugs);
      toast({ title: 'Review added' });
      router.push(`/dashboard/reviews/edit/${created.id}`);
    } catch (error) {
      console.error('Error saving review:', error);
      toast({
        variant: 'destructive',
        title: 'Could not save review',
        description: error instanceof Error ? error.message : 'Failed to save review',
      });
    }
  };

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(onSubmit)}
        aria-label={isEditing ? 'Edit review' : 'Add review'}
      >
        <div className="space-y-6">
          <div className="grid grid-cols-6 gap-6">
            <div className="col-span-6">
              <FormField
                control={form.control}
                name="clinic_id"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="block">Clinic</FormLabel>
                    <ClinicPicker clinics={clinics} value={field.value} onChange={field.onChange} />
                    <FormDescription>
                      Search and select the clinic this review belongs to.
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="col-span-6 sm:col-span-3">
              <FormField
                control={form.control}
                name="author_name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Author name</FormLabel>
                    <FormControl>
                      <Input placeholder="Reviewer name" {...field} />
                    </FormControl>
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
                    <FormLabel>Email</FormLabel>
                    <FormControl>
                      <Input type="email" placeholder="Optional" {...field} />
                    </FormControl>
                    <FormDescription>
                      Leave blank for imported reviews without an email.
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="col-span-6">
              <FormField
                control={form.control}
                name="rating"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Rating</FormLabel>
                    <RatingInput value={field.value} onChange={field.onChange} />
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="col-span-6">
              <FormField
                control={form.control}
                name="text"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Review</FormLabel>
                    <FormControl>
                      <Textarea
                        rows={6}
                        placeholder="What did they say about the clinic?"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="col-span-6 sm:col-span-3">
              <FormField
                control={form.control}
                name="status"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Status</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
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
                    <FormDescription>
                      Approved reviews are shown on the clinic page.
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="col-span-6 sm:col-span-3">
              <FormField
                control={form.control}
                name="source"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Source</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select a source" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {SOURCE_OPTIONS.map((source) => (
                          <SelectItem value={source.value} key={source.value}>
                            {source.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="col-span-6 sm:col-span-3">
              <FormField
                control={form.control}
                name="review_time"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Review date</FormLabel>
                    <FormControl>
                      <Input type="datetime-local" {...field} />
                    </FormControl>
                    <FormDescription>
                      Newer reviews appear first on the clinic page.
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          </div>
        </div>

        <div className="mt-6 flex items-center justify-between">
          <Link href="/dashboard/reviews">Back</Link>
          <Button type="submit" disabled={isSubmitting} className="flex items-center space-x-2">
            {isSubmitting ? (
              <>
                <RefreshCwIcon className="h-4 w-4 animate-spin" />
                <span>{isEditing ? 'Saving...' : 'Adding...'}</span>
              </>
            ) : (
              <span>{isEditing ? 'Save review' : 'Add review'}</span>
            )}
          </Button>
        </div>
      </form>
    </Form>
  );
}
