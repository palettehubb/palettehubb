import { NextRequest, NextResponse } from 'next/server';
import connectToDatabase from '@/lib/db';
import Admin from '@/models/Admin';
import { hashPassword, comparePassword, createAdminToken, ADMIN_COOKIE_NAME } from '@/lib/auth';
import { checkRateLimit } from '@/lib/rateLimit';

export async function POST(req: NextRequest) {
  try {
    // 1. Sliding-window rate limiting (10 attempts per minute per IP)
    const ip = req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || 'admin_ip';
    const rate = checkRateLimit(`admin_login_${ip}`, 10, 60000);
    if (!rate.allowed) {
      return NextResponse.json(
        { success: false, error: 'Too many login attempts. Please wait a minute.' },
        {
          status: 429,
          headers: {
            'Retry-After': Math.ceil((rate.resetTime - Date.now()) / 1000).toString(),
          },
        }
      );
    }

    const body = await req.json();
    const { identifier, password } = body;

    if (!identifier || !password) {
      return NextResponse.json(
        { success: false, error: 'Username/Email and password are required' },
        { status: 400 }
      );
    }

    await connectToDatabase();

    const cleanIdentifier = identifier.trim().toLowerCase();

    // Fast direct lookup without redundant countDocuments()
    let admin = await Admin.findOne({
      $or: [{ username: cleanIdentifier }, { email: cleanIdentifier }],
    });

    // Auto-seed initial default admin ONLY if lookup fails and DB has zero admins
    if (!admin) {
      const adminCount = await Admin.countDocuments();
      if (adminCount === 0) {
        const defaultPasswordHash = await hashPassword('palette123');
        admin = await Admin.create({
          username: 'palettehubb@admin',
          email: 'palettehubb@gmail.com',
          passwordHash: defaultPasswordHash,
          tokenVersion: 0,
        });

        // Check if the input matched the newly seeded admin
        if (cleanIdentifier !== 'palettehubb@admin' && cleanIdentifier !== 'palettehubb@gmail.com') {
          return NextResponse.json(
            { success: false, error: 'Invalid admin credentials' },
            { status: 401 }
          );
        }
      } else {
        return NextResponse.json(
          { success: false, error: 'Invalid admin credentials' },
          { status: 401 }
        );
      }
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
