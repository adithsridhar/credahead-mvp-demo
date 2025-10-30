import { NextResponse } from 'next/server';
import { getAppVersion, getCacheHeaders } from '@/lib/version';

export async function GET() {
  const version = getAppVersion();
  
  const response = NextResponse.json({ 
    version,
    timestamp: Date.now(),
    message: 'Version check endpoint' 
  });
  
  // Add cache headers - short cache for version checks
  const cacheHeaders = getCacheHeaders('api');
  Object.entries(cacheHeaders).forEach(([key, value]) => {
    response.headers.set(key, value);
  });
  
  // Add version header for easy access
  response.headers.set('X-App-Version', version);
  
  return response;
}