import { NextRequest, NextResponse } from 'next/server';
import mongoose from 'mongoose';
import connectToDatabase from '@/lib/db';
import Category from '@/models/Category';
import { uploadImageToCloudinary, deleteImageFromCloudinary } from '@/lib/cloudinary';
import memoryStore from '@/lib/memoryStore';

export async function GET() {
  try {
    const db = await connectToDatabase();
    if (db) {
      const categories = await Category.find({ isActive: true }).sort({ order: 1, createdAt: 1 }).lean();
      return NextResponse.json(
        { success: true, categories },
        {
          headers: {
            'Cache-Control': 'no-store, no-cache, must-revalidate',
          },
        }
      );
    }

    return NextResponse.json({
      success: true,
      categories: [],
    });
  } catch (error: unknown) {
    console.error('Error fetching categories:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to retrieve categories' },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    if (!body.name || !body.name.trim()) {
      return NextResponse.json(
        { success: false, error: 'Category name is required' },
        { status: 400 }
      );
    }

    const cleanName = body.name.trim();
    const slug = (
      body.slug ||
      cleanName.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '')
    );

    let subcategories: string[] = [];
    if (Array.isArray(body.subcategories)) {
      subcategories = body.subcategories.map((s: string) => s.trim()).filter(Boolean);
    } else if (typeof body.subcategories === 'string' && body.subcategories.trim()) {
      subcategories = body.subcategories.split(',').map((s: string) => s.trim()).filter(Boolean);
    }

    let imageUrl = body.image || '';
    if (typeof imageUrl === 'string' && imageUrl.startsWith('data:image/')) {
      const uploadRes = await uploadImageToCloudinary(imageUrl, 'palettehubb/categories');
      imageUrl = uploadRes.secure_url;
    }

    const db = await connectToDatabase();
    if (!db) {
      return NextResponse.json(
        { success: false, error: 'Database service is currently unreachable' },
        { status: 503 }
      );
    }

    const existing = await Category.findOne({ slug });
    if (existing) {
      return NextResponse.json(
        { success: false, error: 'A category with this name or slug already exists' },
        { status: 400 }
      );
    }

    const newCategory = await Category.create({
      name: cleanName,
      slug,
      description: body.description ? body.description.trim() : '',
      image: imageUrl,
      itemCount: 0,
      isActive: true,
      order: body.order ? Number(body.order) : 0,
      subcategories,
    });

    try {
      const plain = JSON.parse(JSON.stringify(newCategory));
      memoryStore.categories = [plain, ...memoryStore.categories.filter(c => c.slug !== plain.slug)];
    } catch {}

    return NextResponse.json({ success: true, category: newCategory }, { status: 201 });
  } catch (error: unknown) {
    console.error('Error creating category:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to create category' },
      { status: 500 }
    );
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const body = await req.json();
    const { slug, categoryName, newSubcategory, removeSubcategory, subcategories, name, description, image, isActive } = body;

    if (!slug && !categoryName) {
      return NextResponse.json(
        { success: false, error: 'Category slug or categoryName is required' },
        { status: 400 }
      );
    }

    const db = await connectToDatabase();
    if (!db) {
      return NextResponse.json({ success: false, error: 'Database unreachable' }, { status: 503 });
    }

    const query = slug
      ? (mongoose.isValidObjectId(slug) ? { $or: [{ _id: slug }, { slug }] } : { slug })
      : { name: { $regex: new RegExp(`^${categoryName}$`, 'i') } };

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const updates: any = {};
    if (name) updates.name = name.trim();
    if (description !== undefined) updates.description = description.trim();
    if (isActive !== undefined) updates.isActive = Boolean(isActive);

    if (image) {
      if (typeof image === 'string' && image.startsWith('data:image/')) {
        const uploadRes = await uploadImageToCloudinary(image, 'palettehubb/categories');
        updates.image = uploadRes.secure_url;
      } else {
        updates.image = image;
      }
    }

    let updated = null;

    if (newSubcategory && typeof newSubcategory === 'string') {
      const trimmed = newSubcategory.trim();
      if (trimmed) {
        updated = await Category.findOneAndUpdate(
          query,
          { $addToSet: { subcategories: trimmed }, $set: updates },
          { new: true }
        );
      }
    } else if (removeSubcategory && typeof removeSubcategory === 'string') {
      updated = await Category.findOneAndUpdate(
        query,
        { $pull: { subcategories: removeSubcategory }, $set: updates },
        { new: true }
      );
    } else if (Array.isArray(subcategories)) {
      updates.subcategories = subcategories.map((s: string) => s.trim()).filter(Boolean);
      updated = await Category.findOneAndUpdate(query, { $set: updates }, { new: true });
    } else {
      updated = await Category.findOneAndUpdate(query, { $set: updates }, { new: true });
    }

    if (!updated) {
      return NextResponse.json({ success: false, error: 'Category not found' }, { status: 404 });
    }

    try {
      const plain = JSON.parse(JSON.stringify(updated));
      memoryStore.categories = memoryStore.categories.map(c =>
        c.slug === plain.slug || c._id?.toString() === plain._id?.toString() ? plain : c
      );
    } catch {}

    return NextResponse.json({ success: true, category: updated });
  } catch (error: unknown) {
    console.error('Error updating category:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to update category' },
      { status: 500 }
    );
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const slug = searchParams.get('slug');
    const id = searchParams.get('id');

    if (!slug && !id) {
      return NextResponse.json({ success: false, error: 'Slug or ID required' }, { status: 400 });
    }

    const db = await connectToDatabase();
    if (!db) {
      return NextResponse.json({ success: false, error: 'Database unreachable' }, { status: 503 });
    }

    let query: Record<string, unknown>;
    if (id) {
      query = mongoose.isValidObjectId(id) ? { _id: id } : { slug: id };
    } else if (slug) {
      query = mongoose.isValidObjectId(slug) ? { $or: [{ _id: slug }, { slug }] } : { slug };
    } else {
      return NextResponse.json({ success: false, error: 'Slug or ID required' }, { status: 400 });
    }

    const category = await Category.findOneAndDelete(query).lean();

    if (!category) {
      return NextResponse.json({ success: false, error: 'Category not found' }, { status: 404 });
    }

    try {
      memoryStore.categories = memoryStore.categories.filter(
        c => c.slug !== slug && c.slug !== category.slug && c._id?.toString() !== category._id?.toString()
      );
    } catch {}

    if (category.image && category.image.includes('cloudinary.com')) {
      deleteImageFromCloudinary(category.image).catch(() => {});
    }

    return NextResponse.json({ success: true, message: 'Category deleted successfully' });
  } catch (error: unknown) {
    console.error('Error deleting category:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to delete category' },
      { status: 500 }
    );
  }
}
