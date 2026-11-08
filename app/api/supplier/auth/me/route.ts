import { NextRequest, NextResponse } from 'next/server';
import { getSupplierSession } from '@/lib/auth';
import connectToDatabase from '@/lib/db';
import Supplier from '@/models/Supplier';

export async function GET(req: NextRequest) {
  const session = await getSupplierSession();
  if (!session) {
    return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
  }

  const db = await connectToDatabase();
  if (!db) {
    return NextResponse.json({ success: true, supplier: session });
  }

  const supplier = await Supplier.findById(session.supplierId).select('-passwordHash').lean();
  if (!supplier) {
    return NextResponse.json({ success: false, error: 'Supplier account not found' }, { status: 404 });
  }

  return NextResponse.json({ success: true, supplier });
}
