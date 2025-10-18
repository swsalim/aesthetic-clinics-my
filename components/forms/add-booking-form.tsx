'use client';

import React, { useState } from 'react';
import { useForm } from 'react-hook-form';

import { zodResolver } from '@hookform/resolvers/zod';
import { CalendarIcon, Loader2 } from 'lucide-react';
import * as z from 'zod';

import { cn } from '@/lib/utils';

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
import { Calendar } from '@/components/ui/calendar';
import { Card, CardContent } from '@/components/ui/card';
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
import { useToast } from '@/components/ui/use-toast';

const schema = z.object({
  name: z.string().min(2, 'Your name is required'),
  contact: z.string().min(2, 'Phone number is required'),
  clinic_name: z.string().optional(),
  url: z.string().url('Valid URL is required'),
  treatment: z.string().min(1, 'Please select a treatment'),
  treatment_date: z.date({
    required_error: 'Please select a preferred treatment date',
  }),
  message: z.string().min(10, 'Message must be at least 10 characters'),
  honeypot: z.string().max(0, { message: 'This field should be empty' }),
});

type BookingFormData = z.infer<typeof schema>;

const TREATMENT_OPTIONS = [
  { value: 'general', label: 'General' },
  { value: 'tooth_extraction', label: 'Tooth Extraction' },
  { value: 'tooth_whitening', label: 'Tooth Whitening' },
  { value: 'dental_filling', label: 'Dental Filling' },
  { value: 'scaling_polishing', label: 'Scaling and Polishing' },
  { value: 'wisdom_teeth_removal', label: 'Wisdom Teeth Removal' },
  { value: 'dental_implant', label: 'Dental Implant' },
  { value: 'root_canal_treatment', label: 'Root Canal Treatment' },
  { value: 'crowning_bridges', label: 'Crowning and Bridges' },
];

type Props = {
  clinicName?: string;
  currentUrl: string;
  area?: string;
};

export default function AddBookingForm({ clinicName, currentUrl, area }: Props) {
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);

  const form = useForm<BookingFormData>({
    resolver: zodResolver(schema),
    defaultValues: {
      name: '',
      contact: '',
      clinic_name: clinicName,
      url: currentUrl,
      treatment: '',
      treatment_date: new Date(),
      message: '',
      honeypot: '',
    },
    mode: 'onChange',
  });

  const onSubmit = async (formData: BookingFormData) => {
    setIsSubmitting(true);

    try {
      if (formData.honeypot) {
        console.log('Honeypot detected, ignoring submission');
        // Still pretend to submit the form to not alert the bot
        setTimeout(() => {
          form.reset();
          setIsSubmitting(false);
        }, 2000);
        return;
      }

      const res = await fetch('/api/booking', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || 'Failed to submit booking');
      }

      toast({ title: 'Success', description: 'Your booking request has been submitted!' });
      setSuccess(true);
      form.reset({
        name: '',
        contact: '',
        clinic_name: clinicName,
        url: currentUrl,
        treatment: '',
        treatment_date: undefined,
        message: '',
        honeypot: '',
      });
    } catch (error: unknown) {
      let message = 'Failed to submit booking request. Please try again later.';
      if (typeof error === 'object' && error && 'message' in error) {
        message = (error as { message?: string }).message || message;
      }
      toast({
        title: 'Error',
        description: message,
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <article className="mt-0">
      <h2 className="mt-0">
        Book an Appointment {clinicName ? `with ${clinicName}` : area ? `in ${area}` : ''}
      </h2>
      <Card>
        <CardContent className="pt-6">
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="flex flex-col gap-y-6">
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

              {/* Hidden fields */}
              <FormField
                control={form.control}
                name="clinic_name"
                render={({ field }) => (
                  <FormItem className="hidden">
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="url"
                render={({ field }) => (
                  <FormItem className="hidden">
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                  </FormItem>
                )}
              />

              <div className="grid grid-cols-1 gap-6">
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
                  name="contact"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Phone Number*</FormLabel>
                      <FormControl>
                        <Input placeholder="Phone number" {...field} />
                      </FormControl>
                      <FormDescription>
                        Please provide your phone number for us to contact you.
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={form.control}
                name="treatment"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Treatment Type*</FormLabel>
                    <Select value={field.value} onValueChange={field.onChange}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select a treatment" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {TREATMENT_OPTIONS.map((treatment) => (
                          <SelectItem key={treatment.value} value={treatment.value}>
                            {treatment.label}
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
                name="treatment_date"
                render={({ field }) => (
                  <FormItem className="flex flex-col">
                    <FormLabel>Preferred Treatment Date*</FormLabel>
                    <Popover>
                      <PopoverTrigger asChild>
                        <FormControl>
                          <Button
                            variant="outline"
                            className={cn(
                              'w-full pl-3 text-left text-sm',
                              !field.value && 'text-gray-500',
                            )}>
                            {field.value ? (
                              field.value.toLocaleDateString()
                            ) : (
                              <span>Pick a date</span>
                            )}
                            <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                          </Button>
                        </FormControl>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0" align="start">
                        <Calendar
                          mode="single"
                          selected={field.value}
                          onSelect={field.onChange}
                          disabled={(date) => date < new Date() || date < new Date('1900-01-01')}
                          initialFocus
                        />
                      </PopoverContent>
                    </Popover>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="message"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Message*</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Please provide details about your dental needs, preferred appointment time, or any specific concerns..."
                        rows={5}
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <Button type="submit" disabled={isSubmitting} className="w-full">
                {isSubmitting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Submitting...
                  </>
                ) : (
                  'Submit Booking Request'
                )}
              </Button>
              {success && (
                <div className="rounded-md bg-green-50 p-4 text-sm text-green-700 dark:bg-green-900/50 dark:text-green-400">
                  <p className="m-0">
                    Your booking request has been submitted successfully. We will contact you
                    shortly to confirm your appointment.
                  </p>
                </div>
              )}
            </form>
          </Form>
        </CardContent>
      </Card>
    </article>
  );
}
