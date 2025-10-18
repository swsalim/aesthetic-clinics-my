import { NextResponse } from 'next/server';

import { sendNewClinicNotification } from '@/lib/email';

export async function POST(request: Request) {
  try {
    const body = await request.json();

    await sendNewClinicNotification({
      name: body.name,
      email: body.email,
      clinicName: body.clinicName,
      clinicEmail: body.clinicEmail,
      phone: body.phone,
      address: body.address,
      description: body.description,
      price: body.price,
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error sending clinic notification:', error);
    return NextResponse.json({ error: 'Failed to send notification email' }, { status: 500 });
  }
}
