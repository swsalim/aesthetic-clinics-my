import { NextResponse } from 'next/server';

import { z } from 'zod';

import { sendNewReviewNotification } from '@/lib/email';
import { createAdminClient } from '@/lib/supabase/admin';

// Review submission schema
const reviewSchema = z.object({
  clinic_id: z.string(),
  author_name: z.string().min(2).max(50),
  email: z.string().email(),
  text: z.string().min(10).max(500),
  rating: z.number().min(1).max(5),
});

export async function POST(request: Request) {
  try {
    // Parse and validate the request body
    const body = await request.json();
    const validatedData = reviewSchema.parse(body);

    const supabase = createAdminClient();

    // Add review to the database
    const { error } = await supabase.from('clinic_reviews').insert({
      clinic_id: validatedData.clinic_id,
      author_name: validatedData.author_name,
      email: validatedData.email,
      text: validatedData.text,
      rating: validatedData.rating,
      review_time: new Date().toISOString(),
      source: 'manual',
      status: 'pending',
    });

    if (error) {
      console.error('Error inserting review:', error);
      return NextResponse.json({ error: 'Failed to submit review' }, { status: 500 });
    }

    // Get clinic name for the email notification
    const { data: clinicData, error: clinicError } = await supabase
      .from('clinics')
      .select('name')
      .eq('id', validatedData.clinic_id)
      .single();

    if (clinicError) {
      console.error('Error fetching clinic data:', clinicError);
    }

    if (!clinicError && clinicData) {
      try {
        // Send email notification about the new review
        await sendNewReviewNotification({
          clinicName: clinicData.name,
          authorName: validatedData.author_name,
          email: validatedData.email,
          rating: validatedData.rating,
          reviewText: validatedData.text,
        });
      } catch (emailError) {
        console.error('Error sending email notification:', emailError);
        // Don't throw the error to avoid failing the whole request
      }
    }

    return NextResponse.json({ message: 'Review submitted successfully' }, { status: 201 });
  } catch (error) {
    console.error('Error processing review:', error);
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid review data', details: error.errors },
        { status: 400 },
      );
    }
    return NextResponse.json({ error: 'Failed to process review' }, { status: 500 });
  }
}
