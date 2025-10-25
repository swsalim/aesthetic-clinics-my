// app/api/webhooks/stripe/route.ts
import { NextRequest, NextResponse } from 'next/server';

import { DatabaseService } from '@/services/database.service';
import Stripe from 'stripe';

import { absoluteUrl } from '@/lib/utils';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);
const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET!;

export async function POST(request: NextRequest) {
  const body = await request.text();
  const signature = request.headers.get('stripe-signature')!;

  let event: Stripe.Event;

  try {
    // Verify the webhook signature
    event = stripe.webhooks.constructEvent(body, signature, webhookSecret);
  } catch (err) {
    console.error('Webhook signature verification failed:', err);
    return NextResponse.json({ error: 'Invalid signature' }, { status: 400 });
  }

  const databaseService = new DatabaseService();

  try {
    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object as Stripe.Checkout.Session;

        // Extract clinic_id from metadata
        const clinicId = session.metadata?.clinic_id;
        if (!clinicId) {
          console.error('No clinic_id in session metadata');
          return NextResponse.json({ error: 'Missing clinic_id' }, { status: 400 });
        }

        console.log(`Processing successful payment for clinic ${clinicId}`);

        // Update clinic status to 'pending' (ready for review)
        await databaseService.updateClinicStatus(clinicId, 'pending');

        // Get updated clinic data
        const clinic = await databaseService.getClinicById(clinicId);
        if (!clinic) {
          console.error(`Clinic ${clinicId} not found`);
          return NextResponse.json({ error: 'Clinic not found' }, { status: 404 });
        }

        // Send notification email
        try {
          await fetch(absoluteUrl('/api/send-email/clinic-notification'), {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              name: session.metadata?.name,
              email: session.metadata?.email,
              clinicName: clinic.name,
              clinicEmail: clinic.email,
              phone: clinic.phone,
              address: clinic.address,
              description: clinic.description,
              price: 'instant',
            }),
          });
        } catch (emailError) {
          console.error('Failed to send notification email:', emailError);
          // Don't fail the webhook for email issues
        }

        console.log(`Successfully processed payment for clinic ${clinicId}`);
        break;
      }

      case 'checkout.session.expired':
      case 'payment_intent.payment_failed': {
        const session = event.data.object as Stripe.Checkout.Session;
        const clinicId = session.metadata?.clinic_id;

        if (clinicId) {
          console.log(`Payment failed/expired for clinic ${clinicId}`);
          // Optionally mark clinic as failed or clean up
          // await databaseService.updateClinicStatus(clinicId, 'payment_failed');
        }
        break;
      }

      default:
        console.log(`Unhandled event type: ${event.type}`);
    }

    return NextResponse.json({ received: true });
  } catch (error) {
    console.error('Webhook handler error:', error);
    return NextResponse.json({ error: 'Webhook handler failed' }, { status: 500 });
  }
}

// Required for Next.js App Router
export const runtime = 'nodejs';
