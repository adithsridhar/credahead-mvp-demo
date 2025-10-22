import { NextRequest, NextResponse } from 'next/server';
import { SignJWT, jwtVerify } from 'jose';

// Admin authentication utilities
const ADMIN_SECRET = new TextEncoder().encode(
  process.env.NEXTAUTH_SECRET || 'fallback-secret-key'
);

const ADMIN_PASSWORD = 'admin'; // Your current admin password
const TOKEN_EXPIRY = '24h'; // Token expires in 24 hours

export interface AdminTokenPayload {
  role: 'admin';
  iat: number;
  exp: number;
}

/**
 * Create a JWT token for admin authentication
 */
export async function createAdminToken(): Promise<string> {
  const token = await new SignJWT({ role: 'admin' })
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime(TOKEN_EXPIRY)
    .sign(ADMIN_SECRET);
  
  return token;
}

/**
 * Verify and decode admin JWT token
 */
export async function verifyAdminToken(token: string): Promise<AdminTokenPayload | null> {
  try {
    const { payload } = await jwtVerify(token, ADMIN_SECRET);
    
    if (payload.role === 'admin') {
      return payload as unknown as AdminTokenPayload;
    }
    
    return null;
  } catch (error) {
    console.error('Admin token verification failed:', error);
    return null;
  }
}

/**
 * Validate admin password
 */
export function validateAdminPassword(password: string): boolean {
  return password === ADMIN_PASSWORD;
}

/**
 * Extract admin token from request (cookie or header)
 */
export function getAdminTokenFromRequest(request: NextRequest): string | null {
  // Try cookie first (most secure)
  const cookieToken = request.cookies.get('admin-token')?.value;
  if (cookieToken) {
    return cookieToken;
  }
  
  // Fallback to Authorization header
  const authHeader = request.headers.get('Authorization');
  if (authHeader?.startsWith('Bearer ')) {
    return authHeader.substring(7);
  }
  
  return null;
}

/**
 * Validate admin authentication from request
 */
export async function validateAdminAuth(request: NextRequest): Promise<boolean> {
  try {
    const token = getAdminTokenFromRequest(request);
    
    if (!token) {
      return false;
    }
    
    const payload = await verifyAdminToken(token);
    return payload !== null;
  } catch (error) {
    console.error('Admin auth validation error:', error);
    return false;
  }
}

/**
 * Set admin token as httpOnly cookie
 */
export function setAdminTokenCookie(response: NextResponse, token: string): void {
  response.cookies.set('admin-token', token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    maxAge: 24 * 60 * 60, // 24 hours in seconds
    path: '/'
  });
}

/**
 * Clear admin token cookie (logout)
 */
export function clearAdminTokenCookie(response: NextResponse): void {
  response.cookies.set('admin-token', '', {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    maxAge: 0,
    path: '/'
  });
}