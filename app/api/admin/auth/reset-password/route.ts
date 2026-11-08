import { NextRequest, NextResponse } from 'next/server';
import connectToDatabase from '@/lib/db';
import Admin from '@/models/Admin';
import { hashPassword, comparePassword, ADMIN_COOKIE_NAME } from '@/lib/auth';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { otp, newPassword } = body;

    if (!otp || !newPassword) {
      return NextResponse.json(
        { success: false, error: 'OTP code and new password are required' },
        { status: 400 }
      );
    }

    if (newPassword.length < 6) {
      return NextResponse.json(
        { success: false, error: 'New password must be at least 6 characters long' },
        { status: 400 }
      );
    }

    await connectToDatabase();
    const admin = await Admin.findOne();

    if (!admin || !admin.resetOtp || !admin.resetOtp.codeHash) {
      return NextResponse.json(
        { success: false, error: 'No active password reset request found. Please request a new OTP.' },
        { status: 400 }
      );
    }

    // Check expiration
    if (new Date() > new Date(admin.resetOtp.expiresAt)) {
      admin.resetOtp = undefined;
      await admin.save();
      return NextResponse.json(
        { success: false, error: 'Verification code has expired. Please request a new code.' },
        { status: 400 }
      );
    }

    // Check max attempts
    if (admin.resetOtp.attempts >= 5) {
      admin.resetOtp = undefined;
      await admin.save();
      return NextResponse.json(
        { success: false, error: 'Too many incorrect attempts. Please request a new OTP.' },
        { status: 429 }
      );
    }

    // Verify OTP
    const isMatch = await comparePassword(otp.trim(), admin.resetOtp.codeHash);
    if (!isMatch) {
      admin.resetOtp.attempts = (admin.resetOtp.attempts || 0) + 1;
      await admin.save();
      return NextResponse.json(
        { success: false, error: `Invalid verification code. ${5 - admin.resetOtp.attempts} attempts remaining.` },
        { status: 400 }
      );
    }

    // Valid OTP: Hash new password
    const newHash = await hashPassword(newPassword);
    admin.passwordHash = newHash;
    admin.resetOtp = undefined;

    // Increment tokenVersion to immediately invalidate all existing sessions across all devices
    admin.tokenVersion = (admin.tokenVersion || 0) + 1;
    await admin.save();

    const response = NextResponse.json({
      success: true,
      message: 'Password reset successfully! All other sessions have been logged out. Please log in with your new password.',
    });

    // Clear active session cookie
    response.cookies.set({
      name: ADMIN_COOKIE_NAME,
      value: '',
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: 0,
    });

    return response;
  } catch (error: unknown) {
    console.error('Reset password error:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error resetting password' },
      { status: 500 }
    );
  }
}
