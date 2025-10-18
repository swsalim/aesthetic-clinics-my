import { NextRequest, NextResponse } from 'next/server';

import { DatabaseService } from '@/services/database.service';

export async function POST(req: NextRequest) {
  try {
    const { clinicId, status } = await req.json();

    if (!clinicId || !status) {
      return NextResponse.json(
        { success: false, error: 'Missing clinicId or status' },
        { status: 400 },
      );
    }

    const db = new DatabaseService();
    const updatedClinic = await db.updateClinicStatus(clinicId, status);

    return NextResponse.json({ success: true, clinic: updatedClinic });
  } catch (error: unknown) {
    console.error('Error updating clinic status:', error);
    const errorMessage = error instanceof Error ? error.message : String(error);
    return NextResponse.json(
      {
        error: 'Failed to update clinic status',
        details: errorMessage,
      },
      { status: 400 },
    );
  }
}
