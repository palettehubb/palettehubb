import React from 'react';
import { redirect } from 'next/navigation';
import { getAdminSession } from '@/lib/auth';
import connectToDatabase from '@/lib/db';
import Admin from '@/models/Admin';
import AdminDashboardClient from '@/components/admin/AdminDashboardClient';

export const metadata = {
  title: 'Admin Operations — Palette Hubb',
  description: 'Manage dropship fulfillment, inventory, and supplier operations.',
};

export default async function AdminPage() {
  const session = await getAdminSession();
  if (!session) {
    redirect('/admin/login');
  }

  await connectToDatabase();
  const admin = await Admin.findById(session.adminId).lean();
  if (!admin || (admin.tokenVersion || 0) !== (session.tokenVersion || 0)) {
    redirect('/admin/login');
  }

  return <AdminDashboardClient />;
}
