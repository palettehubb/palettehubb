import { NextRequest, NextResponse } from 'next/server';
import { uploadImageToCloudinary } from '@/lib/cloudinary';
import { getAdminSession, getSupplierSession } from '@/lib/auth';

export async function POST(req: NextRequest) {
  try {
    // Security check: Only verified admin or supplier can upload assets
    const [adminSession, supplierSession] = await Promise.all([
      getAdminSession(),
      getSupplierSession(),
    ]);

    if (!adminSession && !supplierSession) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized. Authentication required for asset uploads.' },
        { status: 401 }
      );
    }

    const contentType = req.headers.get('content-type') || '';

    let dataUri = '';
    let folder = 'palettehubb/products';

    if (contentType.includes('multipart/form-data')) {
      const formData = await req.formData();
      const file = formData.get('file') as File | null;
      const targetFolder = formData.get('folder') as string | null;

      if (!file) {
        return NextResponse.json({ success: false, error: 'No image file uploaded' }, { status: 400 });
      }

      // Validate mime type
      const allowedTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/avif', 'image/gif'];
      if (!allowedTypes.includes(file.type)) {
        return NextResponse.json(
          { success: false, error: 'Invalid file type. Only JPEG, PNG, WEBP, AVIF, and GIF are permitted.' },
          { status: 400 }
        );
      }

      // Max size: 10MB
      if (file.size > 10 * 1024 * 1024) {
        return NextResponse.json(
          { success: false, error: 'File exceeds 10MB limit.' },
          { status: 400 }
        );
      }

      if (targetFolder) folder = targetFolder;

      const buffer = Buffer.from(await file.arrayBuffer());
      dataUri = `data:${file.type};base64,${buffer.toString('base64')}`;
    } else {
      const body = await req.json();
      if (!body.image) {
        return NextResponse.json({ success: false, error: 'No image data provided' }, { status: 400 });
      }
      dataUri = body.image;
      if (body.folder) folder = body.folder;
    }

    const uploadResult = await uploadImageToCloudinary(dataUri, folder);

    return NextResponse.json({
      success: true,
      url: uploadResult.secure_url,
      publicId: uploadResult.public_id,
      format: uploadResult.format,
      width: uploadResult.width,
      height: uploadResult.height,
    });
  } catch (error: unknown) {
    console.error('Cloudinary upload error:', error);
    const msg = error instanceof Error ? error.message : 'Upload failed';
    return NextResponse.json({ success: false, error: msg }, { status: 500 });
  }
}
