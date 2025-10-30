import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';
import { validateAdminAuth } from '@/lib/auth/adminAuth';
import { getCacheHeaders } from '@/lib/version';

export async function GET(request: NextRequest) {
  try {
    console.log('🚀 Admin stats API called');
    console.log('Environment:', process.env.NODE_ENV);
    console.log('Has SERVICE_ROLE_KEY env var:', !!process.env.SUPABASE_SERVICE_ROLE_KEY);
    console.log('supabaseAdmin exists:', !!supabaseAdmin);
    
    // Validate admin authentication FIRST
    const isAuthorized = await validateAdminAuth(request);
    if (!isAuthorized) {
      console.log('❌ Admin auth failed');
      return NextResponse.json(
        { error: 'Unauthorized: Admin access required' }, 
        { status: 401 }
      );
    }
    console.log('✅ Admin auth passed');

    if (!supabaseAdmin) {
      console.error('❌ supabaseAdmin is null - service role key not loaded properly');
      console.error('Environment:', process.env.NODE_ENV);
      console.error('Has SERVICE_ROLE_KEY env var:', !!process.env.SUPABASE_SERVICE_ROLE_KEY);
      return NextResponse.json({ error: 'Admin client not available' }, { status: 500 });
    }

    console.log('✅ supabaseAdmin client available, proceeding with queries...');

    // Fetch all data using service role client (bypasses RLS)
    const [lessonsRes, questionsRes, usersRes, sessionsRes, allUsersRes, modulesRes, scoresRes] = await Promise.all([
      supabaseAdmin.from('lessons').select('*', { count: 'exact' }),
      supabaseAdmin.from('questions').select('*', { count: 'exact' }),
      supabaseAdmin.from('users').select('*', { count: 'exact' }),
      supabaseAdmin.from('quiz_sessions').select('*', { count: 'exact' }).eq('status', 'completed'),
      supabaseAdmin.from('users').select('id, email, name, literacy_level, assessment_taken, created_at').order('created_at', { ascending: false }),
      supabaseAdmin.from('modules').select('*').order('module_id', { ascending: true }),
      supabaseAdmin.from('scores').select('*', { count: 'exact' }).order('created_at', { ascending: false })
    ]);

    // Check for errors in any of the queries and log more details
    if (lessonsRes.error) {
      console.error('Lessons query error:', lessonsRes.error);
    } else {
      console.log('✅ Lessons query successful, count:', lessonsRes.count);
    }
    
    if (questionsRes.error) {
      console.error('Questions query error:', questionsRes.error);
    } else {
      console.log('✅ Questions query successful, count:', questionsRes.count);
    }
    
    if (usersRes.error) {
      console.error('Users query error:', usersRes.error);
    } else {
      console.log('✅ Users query successful, count:', usersRes.count);
    }
    
    if (sessionsRes.error) {
      console.error('Quiz sessions query error:', sessionsRes.error);
    } else {
      console.log('✅ Sessions query successful, count:', sessionsRes.count);
    }
    
    if (allUsersRes.error) {
      console.error('All users query error:', allUsersRes.error);
    } else {
      console.log('✅ All users query successful, length:', allUsersRes.data?.length);
    }
    
    if (modulesRes.error) {
      console.error('Modules query error:', modulesRes.error);
    } else {
      console.log('✅ Modules query successful, length:', modulesRes.data?.length);
    }
    
    if (scoresRes.error) {
      console.error('Scores query error:', scoresRes.error);
    } else {
      console.log('✅ Scores query successful, count:', scoresRes.count);
    }

    const stats = {
      totalLessons: lessonsRes.count || 0,
      totalQuestions: questionsRes.count || 0,
      totalUsers: usersRes.count || 0,
      totalSessions: sessionsRes.count || 0,
      totalScores: scoresRes.count || 0,
      lessons: lessonsRes.data || [],
      allUsers: allUsersRes.data || [],
      modules: modulesRes.data || [],
      scores: scoresRes.data || [],
    };

    console.log('Admin stats:', {
      totalLessons: stats.totalLessons,
      totalQuestions: stats.totalQuestions,
      totalUsers: stats.totalUsers,
      totalSessions: stats.totalSessions,
      totalScores: stats.totalScores,
      usersCount: stats.allUsers.length
    });

    const response = NextResponse.json(stats);
    
    // Add cache headers for API responses
    const cacheHeaders = getCacheHeaders('api');
    Object.entries(cacheHeaders).forEach(([key, value]) => {
      response.headers.set(key, value);
    });
    
    return response;
  } catch (error) {
    console.error('Admin stats API error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch admin stats' },
      { status: 500 }
    );
  }
}