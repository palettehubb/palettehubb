import { NextRequest, NextResponse } from 'next/server';
import connectToDatabase from '@/lib/db';
import Product from '@/models/Product';
import { uploadImageToCloudinary, deleteImageFromCloudinary } from '@/lib/cloudinary';
import { notifyProductUpdated, notifyProductDeleted } from '@/lib/realtime';
import memoryStore from '@/lib/memoryStore';

export async function GET(
  req: NextRequest,
  context: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await context.params;
    const db = await connectToDatabase();

    if (db) {
      const product = await Product.findOne({
        $or: [{ slug }, { _id: slug }],
      }).lean();
      if (product) {
        return NextResponse.json({ success: true, product });
      }
    }

    return NextResponse.json(
      { success: false, error: 'Product not found' },
      { status: 404 }
    );
  } catch (error: unknown) {
    console.error('Error fetching product by slug:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function PUT(
  req: NextRequest,
  context: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await context.params;
    const body = await req.json();

    const db = await connectToDatabase();
    if (!db) {
      return NextResponse.json(
        { success: false, error: 'Database service is currently unreachable' },
        { status: 503 }
      );
    }

    // Process any new base64 images to Cloudinary
    if (Array.isArray(body.images)) {
      const processed: string[] = [];
      for (const img of body.images) {
        if (typeof img === 'string' && img.startsWith('data:image/')) {
          const uploadRes = await uploadImageToCloudinary(img, 'palettehubb/products');
          processed.push(uploadRes.secure_url);
        } else {
          processed.push(img);
        }
      }
      body.images = processed;
    }

    if (body.price !== undefined) {
      body.price = Math.max(0, Number(body.price) || 0);
    }
    if (body.originalPrice !== undefined) {
      body.originalPrice = Math.max(0, Number(body.originalPrice) || 0);
    }
    if (body.stock !== undefined) {
      body.stock = Math.max(0, Number(body.stock) || 0);
    }

    if (body.originalPrice && body.price) {
      const orig = Number(body.originalPrice);
      const pr = Number(body.price);
      if (orig > pr) {
        body.discountPercent = Math.round(((orig - pr) / orig) * 100);
      }
    }

    const updated = await Product.findOneAndUpdate(
      { $or: [{ slug }, { _id: slug }] },
      { $set: body },
      { new: true }
    ).lean();

    if (!updated) {
      return NextResponse.json({ success: false, error: 'Product not found' }, { status: 404 });
    }

    try {
      notifyProductUpdated(updated);
      memoryStore.products = memoryStore.products.map(p => (p.slug === slug || p._id === slug ? updated : p));
    } catch {}

    return NextResponse.json({
      success: true,
      product: updated,
    });
  } catch (error: unknown) {
    console.error('Error updating product:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to update product' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  req: NextRequest,
  context: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await context.params;
    const db = await connectToDatabase();
    if (!db) {
      return NextResponse.json(
        { success: false, error: 'Database service is currently unreachable' },
        { status: 503 }
      );
    }

    const product = await Product.findOneAndDelete({
      $or: [{ slug }, { _id: slug }],
    }).lean();

    if (!product) {
      return NextResponse.json({ success: false, error: 'Product not found' }, { status: 404 });
    }

    try {
      notifyProductDeleted({ slug, id: product._id?.toString() });
      memoryStore.products = memoryStore.products.filter(p => p.slug !== slug && p._id !== slug);
    } catch {}

    // Remove images from Cloudinary to keep free tier clean
    if (Array.isArray(product.images)) {
      for (const img of product.images) {
        if (typeof img === 'string' && img.includes('cloudinary.com')) {
          deleteImageFromCloudinary(img).catch(() => {});
        }
      }
    }

    return NextResponse.json({ success: true, message: 'Product deleted successfully' });
  } catch (error: unknown) {
    console.error('Error deleting product:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to delete product' },
      { status: 500 }
    );
  }
}
