import { createClient } from '@supabase/supabase-js';

// Test Supabase connection
export async function testSupabaseConnection() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
  
  console.log('Testing Supabase connection...');
  console.log('URL:', supabaseUrl);
  console.log('Key length:', supabaseAnonKey?.length || 0);
  
  if (!supabaseUrl || !supabaseAnonKey) {
    throw new Error('Supabase environment variables are missing');
  }
  
  const supabase = createClient(supabaseUrl, supabaseAnonKey);
  
  try {
    // Try a simple connection test
    const { data, error } = await supabase.from('users').select('count', { count: 'exact', head: true });
    
    if (error) {
      console.error('Supabase connection error:', error);
      throw error;
    }
    
    console.log('Supabase connection successful');
    return { success: true, data };
  } catch (error) {
    console.error('Failed to connect to Supabase:', error);
    throw error;
  }
}