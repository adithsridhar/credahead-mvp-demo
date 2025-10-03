import { NextRequest, NextResponse } from 'next/server';
import { 
  validateAdminPassword, 
  createAdminToken, 
  setAdminTokenCookie 
} from '@/lib/auth/adminAuth';

export async function POST(request: NextRequest) {
  try {
    const { password } = await request.json();
    
    if (!password) {
      return NextResponse.json(
        { error: 'Password is required' }, 
        { status: 400 }
      );
    }
    
    // Validate admin password
    if (!validateAdminPassword(password)) {
      return NextResponse.json(
        { error: 'Invalid admin password' }, 
        { status: 401 }
      );
    }
    
    // Create JWT token
    const token = await createAdminToken();
    
    // Create response with success message
    const response = NextResponse.json({ 
      success: true,
      message: 'Admin authentication successful' 
    });
    
    // Set secure httpOnly cookie
    setAdminTokenCookie(response, token);
    
    return response;
    
  } catch (error) {
    console.error('Admin login error:', error);
    return NextResponse.json(
      { error: 'Authentication failed' }, 
      { status: 500 }
    );
  }
}