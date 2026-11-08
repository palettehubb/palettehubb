import { SignJWT, jwtVerify } from 'jose';
import bcrypt from 'bcryptjs';
import { cookies } from 'next/headers';

const JWT_SECRET = process.env.JWT_SECRET || 'palettehubb_production_secret_key_9824_super_secure_jwt';
const encodedSecret = new TextEncoder().encode(JWT_SECRET);
const SUPPLIER_COOKIE_NAME = 'palette_supplier_session';
const ADMIN_COOKIE_NAME = 'palette_admin_session';

export async function hashPassword(plainText: string): Promise<string> {
  const salt = await bcrypt.genSalt(10);
  return bcrypt.hash(plainText, salt);
}

export async function comparePassword(plainText: string, hash: string): Promise<boolean> {
  return bcrypt.compare(plainText, hash);
}

// ==================== SUPPLIER SESSION ====================

export interface SupplierSessionPayload {
  supplierId: string;
  email: string;
  name: string;
}

export async function createSupplierToken(payload: SupplierSessionPayload): Promise<string> {
  return new SignJWT({ ...payload })
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime('7d')
    .sign(encodedSecret);
}

export async function verifySupplierToken(token: string): Promise<SupplierSessionPayload | null> {
  try {
    const { payload } = await jwtVerify(token, encodedSecret);
    return {
      supplierId: payload.supplierId as string,
      email: payload.email as string,
      name: payload.name as string,
    };
  } catch {
    return null;
  }
}

export async function getSupplierSession(): Promise<SupplierSessionPayload | null> {
  const cookieStore = await cookies();
  const token = cookieStore.get(SUPPLIER_COOKIE_NAME)?.value;
  if (!token) return null;
  return verifySupplierToken(token);
}

// ==================== ADMIN SESSION ====================

export interface AdminSessionPayload {
  adminId: string;
  username: string;
  email: string;
  tokenVersion: number;
}

export async function createAdminToken(payload: AdminSessionPayload): Promise<string> {
  return new SignJWT({ ...payload })
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime('7d')
    .sign(encodedSecret);
}

export async function verifyAdminToken(token: string): Promise<AdminSessionPayload | null> {
  try {
    const { payload } = await jwtVerify(token, encodedSecret);
    return {
      adminId: payload.adminId as string,
      username: payload.username as string,
      email: payload.email as string,
      tokenVersion: Number(payload.tokenVersion ?? 0),
    };
  } catch {
    return null;
  }
}

export async function getAdminSession(): Promise<AdminSessionPayload | null> {
  const cookieStore = await cookies();
  const token = cookieStore.get(ADMIN_COOKIE_NAME)?.value;
  if (!token) return null;
  return verifyAdminToken(token);
}

export { SUPPLIER_COOKIE_NAME, ADMIN_COOKIE_NAME };
