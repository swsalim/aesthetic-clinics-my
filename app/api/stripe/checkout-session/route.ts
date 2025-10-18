import { NextResponse } from 'next/server';

import { DatabaseService } from '@/services/database.service';
import { GoogleMapsService } from '@/services/google-maps.service';
import Stripe from 'stripe';

import { absoluteUrl, slugify } from '@/lib/utils';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);

export async function POST(request: Request) {
  try {
    const body = await request.json();

    // Validate required fields
    if (!body.name || !body.email || !body.clinic_name) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    // Initialize services
    const googleMapsService = new GoogleMapsService();
    const databaseService = new DatabaseService();

    // Geocode address
    const { lat, lng, placeId, neighborhood, city } = await googleMapsService.geocodeAddress(
      body.address,
      body.postal_code,
    );

    // Generate slug
    const slug = slugify(
      `${body.clinic_name}-${body.area_id}-${Math.floor(Math.random() * 10000)}`,
    );

    const clinic = await databaseService.createClinic({
      name: body.clinic_name,
      description: body.description,
      slug,
      state_id: body.state_id,
      area_id: body.area_id,
      address: body.address,
      phone: body.phone,
      postal_code: body.postal_code,
      email: body.clinic_email,
      images: null, // Set to null since images are stored in clinic_images table
      neighborhood,
      city,
      latitude: lat,
      longitude: lng,
      location: `POINT(${lng} ${lat})`,
      youtube_url: body.youtube_url,
      facebook_url: body.facebook_url,
      instagram_url: body.instagram_url,
      featured_video: body.featured_video,
      place_id: placeId,
      source: 'ugc_paid',
      status: 'pending_payment',
    });

    // Insert images into clinic_images table if we have any
    if (body.images && body.images.length > 0) {
      await databaseService.insertClinicImages(clinic.id, body.images);
    }

    // Handle Stripe customer creation/retrieval
    let stripeCustomerId = null;

    try {
      // Check if customer already exists
      const existingCustomers = await stripe.customers.list({
        email: body.email.toLowerCase().trim(),
        limit: 1,
      });

      let customer;
      if (existingCustomers.data.length > 0) {
        // Use existing customer
        customer = existingCustomers.data[0];
        console.log(`Using existing customer: ${customer.id}`);

        // Update metadata for repeat customer
        const currentTotalClinics = parseInt(customer.metadata.total_clinics || '0');
        const updatedMetadata = {
          ...customer.metadata, // Keep existing metadata
          total_clinics: (currentTotalClinics + 1).toString(),
          last_submission: new Date().toISOString(),
          last_clinic_name: body.clinic_name,
        };

        // Update the customer with new metadata
        customer = await stripe.customers.update(customer.id, {
          name: body.name, // Update name in case it changed
          metadata: updatedMetadata,
        });

        console.log(`Updated customer metadata: ${customer.id}`);
      } else {
        // Create new customer
        customer = await stripe.customers.create({
          email: body.email.toLowerCase().trim(),
          name: body.name,
          metadata: {
            first_submission: new Date().toISOString(),
            total_clinics: '1',
            last_submission: new Date().toISOString(),
            last_clinic_name: body.clinic_name,
          },
        });
        console.log(`Created new customer: ${customer.id}`);
      }

      stripeCustomerId = customer.id;
    } catch (customerError) {
      // If customer creation fails, proceed without customer (guest checkout)
      console.warn('Customer creation failed, proceeding with guest checkout:', customerError);
    }

    // Prepare metadata for the session
    const metadata: Record<string, string> = {
      name: body.name || '',
      clinic_name: body.clinic_name || '',
      email: body.email || '',
      clinic_id: clinic.id.toString(),
    };

    // Create checkout session
    const sessionConfig = {
      payment_method_types: ['card' as const],
      mode: 'payment' as const,
      line_items: [
        {
          price_data: {
            currency: 'myr',
            product_data: {
              name: 'Instant Listing',
              description: 'Get your clinic listed with a dofollow backlink in 24 hours.',
            },
            unit_amount: 19900, // RM199.00
          },
          quantity: 1,
        },
      ],
      metadata,
      success_url: absoluteUrl(
        `/submit/success?session_id={CHECKOUT_SESSION_ID}&clinic_id=${clinic.id}`,
      ),
      cancel_url: absoluteUrl('/submit?canceled=1'),
      // Include customer email for receipt
      customer_email: stripeCustomerId ? undefined : body.email, // Only set if no customer
      ...(stripeCustomerId && { customer: stripeCustomerId }), // Include customer if available
    };

    const session = await stripe.checkout.sessions.create(sessionConfig);

    return NextResponse.json({ checkoutUrl: session.url }, { status: 200 });
  } catch (error) {
    console.error('Stripe session creation error:', error);
    return NextResponse.json(
      {
        error: 'Failed to create Stripe session',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 400 },
    );
  }
}
