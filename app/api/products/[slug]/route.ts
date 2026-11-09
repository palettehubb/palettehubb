import { NextRequest, NextResponse } from 'next/server';
import mongoose from 'mongoose';
import connectToDatabase from '@/lib/db';
import Product from '@/models/Product';
import { uploadImageToCloudinary, deleteImageFromCloudinary } from '@/lib/cloudinary';
import { notifyProductUpdated, notifyProductDeleted } from '@/lib/realtime';
import memoryStore from '@/lib/memoryStore';
import { getAdminSession } from '@/lib/auth';

function getProductQuery(slug: string) {
  if (mongoose.isValidObjectId(slug)) {
    return { $or: [{ _id: slug }, { slug }] };
  }
  return { slug };
}

export async function GET(
  req: NextRequest,
  context: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await context.params;
    const db = await connectToDatabase();

    if (db) {
      const product = await Product.findOne(getProductQuery(slug)).lean();
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
    // Security check: Only verified admin session can edit products
    const session = await getAdminSession();
    if (!session) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized. Admin credentials required to modify products.' },
        { status: 401 }
      );
    }

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

    // Process colorImages base64 to Cloudinary
    if (body.variants?.colorImages && Array.isArray(body.variants.colorImages)) {
      const processedColorImages = [];
      for (const ci of body.variants.colorImages) {
        if (!ci || !ci.color) continue;
        let cImg = ci.image || '';
        if (typeof cImg === 'string' && cImg.startsWith('data:image/')) {
          const uploadRes = await uploadImageToCloudinary(cImg, 'palettehubb/products/colors');
          cImg = uploadRes.secure_url;
        }
        processedColorImages.push({ color: String(ci.color).trim(), image: cImg });
      }
      body.variants.colorImages = processedColorImages;
      const mappedColors = processedColorImages.map((ci) => ci.color);
      const existing = Array.isArray(body.variants.colors) ? body.variants.colors : [];
      body.variants.colors = Array.from(new Set([...existing, ...mappedColors]));
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
    if (body.deliveryChargeInsideDubai !== undefined) {
      body.deliveryChargeInsideDubai = Math.max(0, Number(body.deliveryChargeInsideDubai) || 0);
    }
    if (body.deliveryChargeOutsideDubai !== undefined) {
      body.deliveryChargeOutsideDubai = Math.max(0, Number(body.deliveryChargeOutsideDubai) || 0);
    }
    if (body.tax !== undefined) {
      body.tax = Math.max(0, Number(body.tax) || 0);
    }

    if (body.originalPrice && body.price) {
      const orig = Number(body.originalPrice);
      const pr = Number(body.price);
      if (orig > pr) {
        body.discountPercent = Math.round(((orig - pr) / orig) * 100);
      }
    }

    const updated = await Product.findOneAndUpdate(
      getProductQuery(slug),
      { $set: body },
      { new: true }
    ).lean();

    if (!updated) {
      return NextResponse.json({ success: false, error: 'Product not found' }, { status: 404 });
    }

    try {
      notifyProductUpdated(updated);
      memoryStore.products = memoryStore.products.map(p =>
        p.slug === slug || p._id?.toString() === updated._id?.toString() ? updated : p
      );
    } catch {}

    return NextResponse.json({ success: true, product: updated });
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
    // Security check: Only verified admin session can delete products
    const session = await getAdminSession();
    if (!session) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized. Admin credentials required to delete products.' },
        { status: 401 }
      );
    }

    const { slug } = await context.params;
    const db = await connectToDatabase();

    if (!db) {
      return NextResponse.json(
        { success: false, error: 'Database service is currently unreachable' },
        { status: 503 }
      );
    }

    const product = await Product.findOneAndDelete(getProductQuery(slug)).lean();

    if (!product) {
      return NextResponse.json({ success: false, error: 'Product not found' }, { status: 404 });
    }

    try {
      notifyProductDeleted({ slug, id: product._id?.toString() });
      memoryStore.products = memoryStore.products.filter(p => p.slug !== slug && p._id?.toString() !== product._id?.toString());
    } catch {}

    if (Array.isArray(product.images)) {
      for (const img of product.images) {
        if (img && img.includes('cloudinary.com')) {
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
