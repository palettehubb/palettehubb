import { NextRequest, NextResponse } from 'next/server';
import connectToDatabase from '@/lib/db';
import Admin from '@/models/Admin';
import { getAdminSession } from '@/lib/auth';

export async function GET(req: NextRequest) {
  try {
    const session = await getAdminSession();
    if (!session) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    await connectToDatabase();
    const admin = await Admin.findById(session.adminId).lean();

    if (!admin) {
      return NextResponse.json(
        { success: false, error: 'Admin account not found' },
        { status: 401 }
      );
    }

    // Check tokenVersion match to enforce multi-device auto-logout on password change
    if ((admin.tokenVersion || 0) !== (session.tokenVersion || 0)) {
      return NextResponse.json(
        { success: false, error: 'Session invalidated. Please log in again.' },
        { status: 401 }
      );
    }

    return NextResponse.json({
      success: true,
      admin: {
        id: admin._id.toString(),
        username: admin.username,
        email: admin.email,
      },
    });
  } catch (error: unknown) {
    console.error('Admin auth check error:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}
