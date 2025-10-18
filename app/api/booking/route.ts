import { NextResponse } from 'next/server';

import { z } from 'zod';

import { sendNewBookingNotification } from '@/lib/email';

// Booking submission schema
const bookingSchema = z.object({
  name: z.string().min(2, 'Name is required'),
  contact: z.string().min(2, 'Contact information is required'),
  clinic_name: z.string().optional(),
  url: z.string().url('Valid URL is required'),
  treatment: z.string().min(1, 'Treatment type is required'),
  treatment_date: z.date({
    required_error: 'Please select a preferred treatment date',
  }),
  message: z.string().min(10, 'Message must be at least 10 characters'),
  honeypot: z.string().max(0, { message: 'This field should be empty' }),
});

export async function POST(request: Request) {
  try {
    // Parse and validate the request body
    const body = await request.json();
    const parsedBody = {
      ...body,
      treatment_date: body.treatment_date ? new Date(body.treatment_date) : undefined,
    };
    const validatedData = bookingSchema.parse(parsedBody);

    // // Check honeypot field to prevent bot submissions
    // if (validatedData.honeypot) {
    //   console.log('Bot detected - honeypot field filled');
    //   return NextResponse.json({ error: 'Invalid submission' }, { status: 400 });
    // }

    try {
      // Send email notification about the new booking request
      await sendNewBookingNotification({
        clinicName: validatedData.clinic_name,
        customerName: validatedData.name,
        contact: validatedData.contact,
        treatment: validatedData.treatment,
        treatmentDate: validatedData.treatment_date,
        message: validatedData.message,
        url: validatedData.url,
      });
    } catch (emailError) {
      console.error('Error sending email notification:', emailError);
      // Don't throw the error to avoid failing the whole request
    }

    return NextResponse.json(
      { message: 'Booking request submitted successfully' },
      { status: 201 },
    );
  } catch (error) {
    console.error('Error processing booking request:', error);
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid booking data', details: error.errors },
        { status: 400 },
      );
    }
    return NextResponse.json({ error: 'Failed to process booking request' }, { status: 500 });
  }
}
