import { NextResponse } from 'next/server';
import connectToDatabase from '@/lib/db';
import Admin from '@/models/Admin';
import { hashPassword } from '@/lib/auth';
import { sendAdminOtpEmail } from '@/lib/email';

export async function POST() {
  try {
    await connectToDatabase();

    // Auto-seed initial admin if none exists yet
    let admin = await Admin.findOne();
    if (!admin) {
      const defaultPasswordHash = await hashPassword('palette123');
      admin = await Admin.create({
        username: 'palettehubb@admin',
        email: 'palettehubb@gmail.com',
        passwordHash: defaultPasswordHash,
        tokenVersion: 0,
      });
    }

    // Generate secure 6-digit numeric OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const codeHash = await hashPassword(otp);
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

    admin.resetOtp = {
      codeHash,
      expiresAt,
      attempts: 0,
    };
    await admin.save();

    // Dispatch OTP email to admin's official inbox
    const recipient = admin.email || 'palettehubb@gmail.com';
    const emailSent = await sendAdminOtpEmail(recipient, otp);

    if (!emailSent) {
      return NextResponse.json(
        { success: false, error: 'Failed to send OTP email. Please verify mail configuration.' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: `A 6-digit verification code has been sent to ${recipient}. It expires in 10 minutes.`,
    });
  } catch (error: unknown) {
    console.error('Forgot password error:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error processing forgot password' },
      { status: 500 }
    );
  }
}
