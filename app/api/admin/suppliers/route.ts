import { NextRequest, NextResponse } from 'next/server';
import mongoose from 'mongoose';
import connectToDatabase from '@/lib/db';
import Supplier from '@/models/Supplier';
import { hashPassword } from '@/lib/auth';

export async function GET() {
  try {
    const db = await connectToDatabase();
    if (db) {
      const suppliers = await Supplier.find().select('-passwordHash').sort({ createdAt: -1 }).lean();
      return NextResponse.json({ success: true, suppliers });
    }

    return NextResponse.json({
      success: true,
      suppliers: [],
    });
  } catch (error: unknown) {
    console.error('Error fetching suppliers:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to retrieve suppliers' },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    if (!body.name || !body.email || !body.phone) {
      return NextResponse.json(
        { success: false, error: 'Supplier company name, email, and phone are required' },
        { status: 400 }
      );
    }

    const plainPassword = body.password ? body.password.trim() : 'Supplier@123';
    if (plainPassword.length < 6) {
      return NextResponse.json(
        { success: false, error: 'Supplier password must be at least 6 characters' },
        { status: 400 }
      );
    }

    const passwordHash = await hashPassword(plainPassword);
    const cleanEmail = body.email.trim().toLowerCase();

    const db = await connectToDatabase();
    if (!db) {
      return NextResponse.json(
        { success: false, error: 'Database service is currently unreachable' },
        { status: 503 }
      );
    }

    const existing = await Supplier.findOne({ email: cleanEmail });
    if (existing) {
      return NextResponse.json(
        { success: false, error: 'A supplier with this email already exists' },
        { status: 400 }
      );
    }

    const created = await Supplier.create({
      name: body.name.trim(),
      contactName: body.contactName ? body.contactName.trim() : body.name.trim(),
      email: cleanEmail,
      passwordHash,
      phone: body.phone.trim(),
      website: body.website ? body.website.trim() : '',
      leadTimeDays: Number(body.leadTimeDays) || 3,
      notes: body.notes ? body.notes.trim() : '',
      isActive: true,
    });

    const supplierData = created.toObject();
    delete supplierData.passwordHash;

    return NextResponse.json({ success: true, supplier: supplierData }, { status: 201 });
  } catch (error: unknown) {
    console.error('Error creating supplier:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to create supplier' },
      { status: 500 }
    );
  }
}

export async function PUT(req: NextRequest) {
  try {
    const body = await req.json();
    const { id, name, contactName, email, phone, website, leadTimeDays, notes, isActive, password } = body;

    if (!id) {
      return NextResponse.json({ success: false, error: 'Supplier ID is required' }, { status: 400 });
    }

    const db = await connectToDatabase();
    if (!db) {
      return NextResponse.json(
        { success: false, error: 'Database service is currently unreachable' },
        { status: 503 }
      );
    }

    const supplier = await Supplier.findById(id);
    if (!supplier) {
      return NextResponse.json({ success: false, error: 'Supplier not found' }, { status: 404 });
    }

    if (name) supplier.name = name.trim();
    if (contactName) supplier.contactName = contactName.trim();
    if (email) {
      const cleanEmail = email.trim().toLowerCase();
      // Check if email taken by another supplier
      const existing = await Supplier.findOne({ email: cleanEmail, _id: { $ne: id } });
      if (existing) {
        return NextResponse.json(
          { success: false, error: 'Email is already taken by another supplier' },
          { status: 400 }
        );
      }
      supplier.email = cleanEmail;
    }
    if (phone) supplier.phone = phone.trim();
    if (website !== undefined) supplier.website = website.trim();
    if (leadTimeDays !== undefined) supplier.leadTimeDays = Number(leadTimeDays) || 3;
    if (notes !== undefined) supplier.notes = notes.trim();
    if (isActive !== undefined) supplier.isActive = Boolean(isActive);

    // Update password if provided
    if (password && password.trim().length > 0) {
      const plain = password.trim();
      if (plain.length < 6) {
        return NextResponse.json(
          { success: false, error: 'New password must be at least 6 characters' },
          { status: 400 }
        );
      }
      supplier.passwordHash = await hashPassword(plain);
    }

    await supplier.save();

    const supplierData = supplier.toObject();
    delete supplierData.passwordHash;

    return NextResponse.json({
      success: true,
      message: 'Supplier updated successfully',
      supplier: supplierData,
    });
  } catch (error: unknown) {
    console.error('Error updating supplier:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to update supplier' },
      { status: 500 }
    );
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');
    if (!id) {
      return NextResponse.json({ success: false, error: 'Supplier ID is required' }, { status: 400 });
    }

    const db = await connectToDatabase();
    if (!db) {
      return NextResponse.json({ success: false, error: 'Database service unreachable' }, { status: 503 });
    }

    if (mongoose.isValidObjectId(id)) {
      await Supplier.findOneAndDelete({ _id: id });
    } else {
      return NextResponse.json({ success: false, error: 'Invalid supplier ID' }, { status: 400 });
    }

    return NextResponse.json({ success: true, message: 'Supplier deleted successfully' });
  } catch (error: unknown) {
    console.error('Error deleting supplier:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to delete supplier' },
      { status: 500 }
    );
  }
}
