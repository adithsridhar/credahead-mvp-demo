import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { getCacheHeaders } from '@/lib/version';

export async function POST(request: NextRequest) {
  try {
    // Get the user's score from request body
    const { score } = await request.json();
    
    if (typeof score !== 'number' || score < 1 || score > 10) {
      return NextResponse.json({ 
        error: 'Invalid score. Must be a number between 1 and 10.' 
      }, { status: 400 });
    }

    // Create server-side Supabase client with service role
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!,
      {
        auth: {
          autoRefreshToken: false,
          persistSession: false
        }
      }
    );

    // Server-side percentile calculation (bypasses RLS with service role)
    const { data: allScores, error } = await supabase
      .from('scores')
      .select('score')
      .order('score', { ascending: true });
    
    if (error) {
      console.error('Error fetching scores for percentile calculation:', error);
      return NextResponse.json({ 
        error: 'Failed to calculate percentile' 
      }, { status: 500 });
    }
    
    if (!allScores || allScores.length === 0) {
      return NextResponse.json({ percentile: 50 }); // Default if no data
    }
    
    const scores = allScores.map(record => record.score);
    const totalCount = scores.length;
    
    // Count scores below user's score
    const countBelow = scores.filter(s => s < score).length;
    
    // Count exact ties
    const countTies = scores.filter(s => s === score).length;
    
    // Calculate percentile using the formula: (count below + 0.5 * count of ties) / total * 100
    const percentile = ((countBelow + 0.5 * countTies) / totalCount) * 100;
    
    // Round to nearest integer
    const roundedPercentile = Math.round(percentile);
    
    const response = NextResponse.json({ 
      percentile: roundedPercentile,
      totalScores: totalCount // For debugging/verification
    });
    
    // Add cache headers for API responses
    const cacheHeaders = getCacheHeaders('api');
    Object.entries(cacheHeaders).forEach(([key, value]) => {
      response.headers.set(key, value);
    });
    
    return response;
    
  } catch (error) {
    console.error('Error in percentile calculation API:', error);
    return NextResponse.json({ 
      error: 'Internal server error' 
    }, { status: 500 });
  }
}