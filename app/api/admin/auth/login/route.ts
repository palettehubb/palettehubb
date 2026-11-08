import { NextRequest, NextResponse } from 'next/server';
import connectToDatabase from '@/lib/db';
import Admin from '@/models/Admin';
import { hashPassword, comparePassword, createAdminToken, ADMIN_COOKIE_NAME } from '@/lib/auth';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { identifier, password } = body;

    if (!identifier || !password) {
      return NextResponse.json(
        { success: false, error: 'Username/Email and password are required' },
        { status: 400 }
      );
    }

    await connectToDatabase();

    // Auto-seed initial default admin if no admin exists
    const adminCount = await Admin.countDocuments();
    if (adminCount === 0) {
      const defaultPasswordHash = await hashPassword('palette123');
      await Admin.create({
        username: 'palettehubb@admin',
        email: 'palettehubb@gmail.com',
        passwordHash: defaultPasswordHash,
        tokenVersion: 0,
      });
    }

    const cleanIdentifier = identifier.trim().toLowerCase();
    const admin = await Admin.findOne({
      $or: [{ username: cleanIdentifier }, { email: cleanIdentifier }],
    });

    if (!admin) {
      return NextResponse.json(
        { success: false, error: 'Invalid admin credentials' },
        { status: 401 }
      );
    }

    const isValid = await comparePassword(password, admin.passwordHash);
    if (!isValid) {
      return NextResponse.json(
        { success: false, error: 'Invalid admin credentials' },
        { status: 401 }
      );
    }

    const token = await createAdminToken({
      adminId: admin._id.toString(),
      username: admin.username,
      email: admin.email,
      tokenVersion: admin.tokenVersion || 0,
    });

    const response = NextResponse.json({
      success: true,
      admin: {
        id: admin._id.toString(),
        username: admin.username,
        email: admin.email,
      },
    });

    response.cookies.set({
      name: ADMIN_COOKIE_NAME,
      value: token,
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: 7 * 24 * 60 * 60, // 7 days
    });

    return response;
  } catch (error: unknown) {
    console.error('Admin login error:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error during login' },
      { status: 500 }
    );
  }
}
