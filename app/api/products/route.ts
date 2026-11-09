import { NextRequest, NextResponse } from 'next/server';
import connectToDatabase from '@/lib/db';
import Product from '@/models/Product';
import { uploadImageToCloudinary } from '@/lib/cloudinary';
import { notifyProductCreated } from '@/lib/realtime';
import memoryStore from '@/lib/memoryStore';
import { getAdminSession } from '@/lib/auth';

function escapeRegex(text: string): string {
  return text.replace(/[-[\]{}()*+?.,\\^$|#\s]/g, '\\$&');
}

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const category = searchParams.get('category');
    const subcategory = searchParams.get('subcategory');
    const search = searchParams.get('search');
    const minPrice = searchParams.get('minPrice') ? Number(searchParams.get('minPrice')) : null;
    const maxPrice = searchParams.get('maxPrice') ? Number(searchParams.get('maxPrice')) : null;
    const sort = searchParams.get('sort') || 'featured';
    const featured = searchParams.get('featured');
    const offers = searchParams.get('offers');
    const bestSeller = searchParams.get('bestseller');
    const limit = Math.min(100, Math.max(1, Number(searchParams.get('limit')) || 50));
    const page = Math.max(1, Number(searchParams.get('page')) || 1);

    const db = await connectToDatabase();
    if (!db) {
      return NextResponse.json({ success: true, count: 0, products: [] });
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const query: any = { isAvailable: true };

    if (category && category !== 'all') {
      query.category = { $regex: new RegExp(`^${escapeRegex(category)}$`, 'i') };
    }

    if (subcategory && subcategory !== 'all') {
      query.subcategory = { $regex: new RegExp(`^${escapeRegex(subcategory)}$`, 'i') };
    }

    if (search && search.trim()) {
      const safeSearch = escapeRegex(search.trim());
      query.$or = [
        { name: { $regex: safeSearch, $options: 'i' } },
        { description: { $regex: safeSearch, $options: 'i' } },
        { tags: { $in: [new RegExp(safeSearch, 'i')] } },
      ];
    }

    if (featured === 'true') {
      query.isFeatured = true;
    }

    if (offers === 'true') {
      query.$or = [{ discountPercent: { $gt: 0 } }, { originalPrice: { $gt: 0 } }];
    }

    if (minPrice !== null || maxPrice !== null) {
      query.price = {};
      if (minPrice !== null) query.price.$gte = minPrice;
      if (maxPrice !== null) query.price.$lte = maxPrice;
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    let sortOpt: any = { createdAt: -1 };
    if (sort === 'price-asc') sortOpt = { price: 1 };
    if (sort === 'price-desc') sortOpt = { price: -1 };
    if (sort === 'rating') sortOpt = { rating: -1 };
    if (sort === 'best-seller' || bestSeller === 'true') sortOpt = { salesCount: -1, rating: -1 };
    if (sort === 'featured') sortOpt = { isFeatured: -1, createdAt: -1 };

    const skip = (page - 1) * limit;
    const [products, total] = await Promise.all([
      Product.find(query).sort(sortOpt).skip(skip).limit(limit).lean(),
      Product.countDocuments(query),
    ]);

    return NextResponse.json(
      {
        success: true,
        count: products.length,
        total,
        page,
        products,
      },
      {
        headers: {
          'Cache-Control': 'no-store, no-cache, must-revalidate',
        },
      }
    );
  } catch (error: unknown) {
    console.error('Error fetching products:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to retrieve products' },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    // Security check: Only verified admin session can create products
    const session = await getAdminSession();
    if (!session) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized. Admin credentials required to add products.' },
        { status: 401 }
      );
    }

    const body = await req.json();

    if (!body.name || body.price === undefined || !body.category) {
      return NextResponse.json(
        { success: false, error: 'Product name, price, and category are required' },
        { status: 400 }
      );
    }

    const price = Math.max(0, Number(body.price) || 0);
    const originalPrice = body.originalPrice ? Math.max(0, Number(body.originalPrice) || 0) : undefined;
    let discountPercent = 0;
    if (originalPrice && originalPrice > price) {
      discountPercent = Math.round(((originalPrice - price) / originalPrice) * 100);
    } else if (body.discountPercent) {
      discountPercent = Number(body.discountPercent);
    }

    const deliveryChargeInsideDubai = Math.max(0, Number(body.deliveryChargeInsideDubai) || 0);
    const deliveryChargeOutsideDubai = Math.max(0, Number(body.deliveryChargeOutsideDubai) || 0);
    const tax = Math.max(0, Number(body.tax) || 0);

    // Handle Cloudinary upload for any base64 image strings
    const processedImages: string[] = [];
    if (Array.isArray(body.images)) {
      for (const img of body.images) {
        if (typeof img === 'string') {
          if (img.startsWith('data:image/')) {
            const uploadRes = await uploadImageToCloudinary(img, 'palettehubb/products');
            processedImages.push(uploadRes.secure_url);
          } else {
            processedImages.push(img);
          }
        }
      }
    }

    const variants = body.variants || { sizes: ['Standard'], colors: [] };
    if (variants.colorImages && Array.isArray(variants.colorImages)) {
      const processedColorImages = [];
      for (const ci of variants.colorImages) {
        if (!ci || !ci.color) continue;
        let cImg = ci.image || '';
        if (typeof cImg === 'string' && cImg.startsWith('data:image/')) {
          const uploadRes = await uploadImageToCloudinary(cImg, 'palettehubb/products/colors');
          cImg = uploadRes.secure_url;
        }
        processedColorImages.push({ color: String(ci.color).trim(), image: cImg });
      }
      variants.colorImages = processedColorImages;
      const mappedColorNames = processedColorImages.map((ci) => ci.color);
      const existingColors = Array.isArray(variants.colors) ? variants.colors : [];
      variants.colors = Array.from(new Set([...existingColors, ...mappedColorNames]));
    }

    const cleanSlug = (
      body.slug ||
      body.name
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/(^-|-$)+/g, '')
    ) + `-${Date.now().toString().slice(-4)}`;

    const db = await connectToDatabase();
    if (!db) {
      return NextResponse.json(
        { success: false, error: 'Database service is currently unreachable' },
        { status: 503 }
      );
    }

    const newProduct = await Product.create({
      name: body.name.trim(),
      slug: cleanSlug,
      description: body.description ? body.description.trim() : '',
      category: body.category.trim(),
      subcategory: body.subcategory ? body.subcategory.trim() : '',
      price,
      originalPrice: originalPrice || 0,
      discountPercent,
      deliveryChargeInsideDubai,
      deliveryChargeOutsideDubai,
      tax,
      images: processedImages,
      stock: body.stock !== undefined ? Math.max(0, Number(body.stock)) : 10,
      variants,
      rating: 5.0,
      reviewsCount: 0,
      salesCount: 0,
      isFeatured: Boolean(body.isFeatured),
      isAvailable: body.isAvailable !== false,
      supplierId: body.supplierId || '',
      tags: Array.isArray(body.tags) ? body.tags : [],
    });

    try {
      notifyProductCreated(newProduct);
      memoryStore.products = [newProduct, ...memoryStore.products.filter(p => p.slug !== newProduct.slug)];
    } catch {}

    return NextResponse.json({ success: true, product: newProduct }, { status: 201 });
  } catch (error: unknown) {
    console.error('Error creating product:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to create product' },
      { status: 500 }
    );
  }
}
