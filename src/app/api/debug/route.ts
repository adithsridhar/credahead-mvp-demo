import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';

export async function GET(request: NextRequest) {
  console.log('🐛 DEBUG API called');
  console.log('Environment:', process.env.NODE_ENV);
  console.log('Has SERVICE_ROLE_KEY env var:', !!process.env.SUPABASE_SERVICE_ROLE_KEY);
  console.log('SERVICE_ROLE_KEY value (first 20 chars):', process.env.SUPABASE_SERVICE_ROLE_KEY?.substring(0, 20) || 'UNDEFINED');
  console.log('supabaseAdmin exists:', !!supabaseAdmin);
  
  if (!supabaseAdmin) {
    console.log('❌ supabaseAdmin is null');
    return NextResponse.json({ error: 'supabaseAdmin is null', env: process.env.NODE_ENV });
  }
  
  console.log('✅ Testing simple query...');
  
  try {
    const { data, error, count } = await supabaseAdmin
      .from('lessons')
      .select('*', { count: 'exact' });
    
    console.log('Query result:');
    console.log('- Error:', error);
    console.log('- Count:', count);
    console.log('- Data length:', data?.length);
    
    return NextResponse.json({
      success: true,
      hasAdmin: !!supabaseAdmin,
      env: process.env.NODE_ENV,
      hasServiceKey: !!process.env.SUPABASE_SERVICE_ROLE_KEY,
      error: error?.message || null,
      count: count,
      dataLength: data?.length || 0
    });
  } catch (err) {
    console.error('Query failed:', err);
    return NextResponse.json({ 
      error: 'Query failed', 
      details: err instanceof Error ? err.message : String(err) 
    });
  }
}