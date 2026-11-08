'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  Lock,
  Mail,
  KeyRound,
  Eye,
  EyeOff,
  AlertCircle,
  CheckCircle2,
  ShieldCheck,
  ArrowRight,
  RefreshCw,
} from 'lucide-react';

export default function AdminLoginPage() {
  const router = useRouter();

  // Login form state
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Forgot password modal state
  const [forgotModalOpen, setForgotModalOpen] = useState(false);
  const [forgotStep, setForgotStep] = useState<'request' | 'verify'>('request');
  const [otp, setOtp] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [forgotLoading, setForgotLoading] = useState(false);
  const [forgotError, setForgotError] = useState<string | null>(null);
  const [forgotSuccess, setForgotSuccess] = useState<string | null>(null);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const res = await fetch('/api/admin/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ identifier, password }),
      });

      const data = await res.json();
      if (!data.success) {
        throw new Error(data.error || 'Invalid credentials');
      }

      router.push('/admin');
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Login failed');
      setLoading(false);
    }
  };

  const handleRequestOtp = async () => {
    setForgotError(null);
    setForgotLoading(true);

    try {
      const res = await fetch('/api/admin/auth/forgot-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      });

      const data = await res.json();
      if (!data.success) {
        throw new Error(data.error || 'Failed to dispatch verification code');
      }

      setForgotStep('verify');
      setForgotSuccess(data.message || 'OTP sent to palettehubb@gmail.com');
    } catch (err: unknown) {
      setForgotError(err instanceof Error ? err.message : 'Error sending OTP');
    } finally {
      setForgotLoading(false);
    }
  };

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setForgotError(null);

    if (newPassword.length < 6) {
      setForgotError('Password must be at least 6 characters long');
      return;
    }

    if (newPassword !== confirmPassword) {
      setForgotError('Passwords do not match');
      return;
    }

    setForgotLoading(true);

    try {
      const res = await fetch('/api/admin/auth/reset-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ otp: otp.trim(), newPassword }),
      });

      const data = await res.json();
      if (!data.success) {
        throw new Error(data.error || 'Failed to reset password');
      }

      setForgotSuccess('Password updated! You can now log in.');
      setTimeout(() => {
        setForgotModalOpen(false);
        setForgotStep('request');
        setOtp('');
        setNewPassword('');
        setConfirmPassword('');
        setForgotSuccess(null);
      }, 2000);
    } catch (err: unknown) {
      setForgotError(err instanceof Error ? err.message : 'Failed to reset password');
    } finally {
      setForgotLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-white text-neutral-900 flex flex-col justify-center items-center px-4 py-12 select-none relative">
      {/* Forgot Password Modal */}
      {forgotModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
          <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-md w-full shadow-2xl border border-neutral-200 animate-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between pb-4 border-b border-neutral-100 mb-5">
              <div className="flex items-center gap-2">
                <KeyRound className="w-5 h-5 text-neutral-800" />
                <h3 className="font-extrabold text-neutral-900 text-base">Reset Password</h3>
              </div>
              <button
                type="button"
                onClick={() => setForgotModalOpen(false)}
                className="text-neutral-400 hover:text-black text-xs font-bold px-2 py-1 rounded-lg cursor-pointer"
              >
                ✕ Close
              </button>
            </div>

            {forgotError && (
              <div className="mb-4 p-3 rounded-xl bg-red-50 border border-red-200 flex items-center gap-2 text-red-800 text-xs">
                <AlertCircle className="w-4 h-4 shrink-0 text-red-600" />
                <span>{forgotError}</span>
              </div>
            )}

            {forgotSuccess && (
              <div className="mb-4 p-3 rounded-xl bg-emerald-50 border border-emerald-200 flex items-center gap-2 text-emerald-800 text-xs">
                <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-600" />
                <span>{forgotSuccess}</span>
              </div>
            )}

            {forgotStep === 'request' ? (
              <div className="space-y-4">
                <p className="text-xs text-neutral-600 leading-relaxed">
                  Click below to receive a secure 6-digit one-time code at{' '}
                  <strong className="text-black">palettehubb@gmail.com</strong>.
                </p>

                <button
                  type="button"
                  onClick={handleRequestOtp}
                  disabled={forgotLoading}
                  className="w-full bg-black hover:bg-neutral-800 text-white font-bold text-xs py-3 rounded-xl transition-all shadow-sm flex items-center justify-center gap-2 cursor-pointer disabled:opacity-60"
                >
                  {forgotLoading ? (
                    <>
                      <RefreshCw className="w-4 h-4 animate-spin" />
                      <span>Sending OTP code...</span>
                    </>
                  ) : (
                    <span>Send Verification Code to Email</span>
                  )}
                </button>
              </div>
            ) : (
              <form onSubmit={handleResetPassword} className="space-y-4">
                <div>
                  <label className="block text-[11px] font-bold text-neutral-700 uppercase mb-1">
                    6-Digit OTP Code
                  </label>
                  <input
                    type="text"
                    required
                    maxLength={6}
                    placeholder="123456"
                    value={otp}
                    onChange={(e) => setOtp(e.target.value)}
                    className="w-full bg-neutral-50 border border-neutral-200 rounded-xl px-3.5 py-2.5 text-center font-mono tracking-widest text-lg font-bold text-neutral-900 focus:outline-none focus:border-black"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-neutral-700 uppercase mb-1">
                    New Password
                  </label>
                  <input
                    type="password"
                    required
                    placeholder="At least 6 characters"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    className="w-full bg-neutral-50 border border-neutral-200 rounded-xl px-3.5 py-2.5 text-xs text-neutral-900 focus:outline-none focus:border-black"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-neutral-700 uppercase mb-1">
                    Confirm New Password
                  </label>
                  <input
                    type="password"
                    required
                    placeholder="Repeat new password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="w-full bg-neutral-50 border border-neutral-200 rounded-xl px-3.5 py-2.5 text-xs text-neutral-900 focus:outline-none focus:border-black"
                  />
                </div>

                <div className="pt-2 flex gap-2">
                  <button
                    type="button"
                    onClick={handleRequestOtp}
                    disabled={forgotLoading}
                    className="w-1/3 bg-neutral-100 hover:bg-neutral-200 text-neutral-800 font-bold text-xs py-2.5 rounded-xl transition-all cursor-pointer"
                  >
                    Resend
                  </button>
                  <button
                    type="submit"
                    disabled={forgotLoading}
                    className="flex-1 bg-black hover:bg-neutral-800 text-white font-bold text-xs py-2.5 rounded-xl transition-all shadow-sm cursor-pointer disabled:opacity-60"
                  >
                    {forgotLoading ? 'Updating...' : 'Set New Password'}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}

      {/* Main Card */}
      <div className="max-w-md w-full bg-white border border-neutral-200 rounded-3xl p-8 sm:p-10 shadow-lg">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="w-12 h-12 bg-neutral-100 rounded-2xl flex items-center justify-center mx-auto mb-4 border border-neutral-200">
            <Lock className="w-6 h-6 text-neutral-900" />
          </div>
          <h1 className="text-2xl font-black tracking-tight text-neutral-900">
            Admin
          </h1>
          <p className="text-xs text-neutral-500 mt-1">
            Sign in to manage catalog, orders, and supplier fulfillment
          </p>
        </div>

        {error && (
          <div className="mb-6 p-3.5 rounded-2xl bg-red-50 border border-red-200 flex items-center gap-2.5 text-red-800 text-xs font-medium">
            <AlertCircle className="w-4 h-4 shrink-0 text-red-600" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-neutral-700 uppercase mb-1.5">
              Username or Email
            </label>
            <div className="relative">
              <Mail className="w-4 h-4 text-neutral-400 absolute left-3.5 top-3 pointer-events-none" />
              <input
                type="text"
                required
                placeholder="palettehubb@admin"
                value={identifier}
                onChange={(e) => setIdentifier(e.target.value)}
                className="w-full bg-neutral-50 border border-neutral-200 rounded-xl py-2.5 pl-10 pr-3.5 text-xs text-neutral-900 placeholder:text-neutral-400 focus:outline-none focus:border-black font-medium"
              />
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="block text-xs font-bold text-neutral-700 uppercase">
                Password
              </label>
              <button
                type="button"
                onClick={() => {
                  setForgotModalOpen(true);
                  setForgotStep('request');
                  setForgotError(null);
                  setForgotSuccess(null);
                }}
                className="text-xs text-neutral-500 hover:text-black underline underline-offset-2 cursor-pointer font-medium"
              >
                Forgot Password?
              </button>
            </div>
            <div className="relative">
              <KeyRound className="w-4 h-4 text-neutral-400 absolute left-3.5 top-3 pointer-events-none" />
              <input
                type={showPassword ? 'text' : 'password'}
                required
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-neutral-50 border border-neutral-200 rounded-xl py-2.5 pl-10 pr-10 text-xs text-neutral-900 placeholder:text-neutral-400 focus:outline-none focus:border-black font-medium"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-2.5 text-neutral-400 hover:text-neutral-700 cursor-pointer"
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          <div className="pt-2">
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-black hover:bg-neutral-800 text-white font-bold text-xs py-3.5 rounded-xl transition-all shadow-md flex items-center justify-center gap-2 cursor-pointer disabled:opacity-60"
            >
              {loading ? (
                <span>Verifying credentials...</span>
              ) : (
                <>
                  <span>Sign In as Admin</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </div>
        </form>

        <div className="mt-8 pt-6 border-t border-neutral-100 flex items-center justify-between text-[11px] text-neutral-500">
          <Link href="/" className="hover:text-black">
            ← Back to Store
          </Link>
          <div className="flex items-center gap-1 text-emerald-700 font-semibold">
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>256-Bit SSL Encrypted</span>
          </div>
        </div>
      </div>
    </div>
  );
}
