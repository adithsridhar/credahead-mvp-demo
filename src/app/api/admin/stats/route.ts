import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';
import { validateAdminAuth } from '@/lib/auth/adminAuth';

export async function GET(request: NextRequest) {
  try {
    // Validate admin authentication FIRST
    const isAuthorized = await validateAdminAuth(request);
    if (!isAuthorized) {
      return NextResponse.json(
        { error: 'Unauthorized: Admin access required' }, 
        { status: 401 }
      );
    }

    if (!supabaseAdmin) {
      return NextResponse.json({ error: 'Admin client not available' }, { status: 500 });
    }

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

    // Check for errors in any of the queries
    if (lessonsRes.error) {
      console.error('Lessons query error:', lessonsRes.error);
    }
    if (questionsRes.error) {
      console.error('Questions query error:', questionsRes.error);
    }
    if (usersRes.error) {
      console.error('Users query error:', usersRes.error);
    }
    if (sessionsRes.error) {
      console.error('Quiz sessions query error:', sessionsRes.error);
    }
    if (allUsersRes.error) {
      console.error('All users query error:', allUsersRes.error);
    }
    if (modulesRes.error) {
      console.error('Modules query error:', modulesRes.error);
    }
    if (scoresRes.error) {
      console.error('Scores query error:', scoresRes.error);
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

    return NextResponse.json(stats);
  } catch (error) {
    console.error('Admin stats API error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch admin stats' },
      { status: 500 }
    );
  }
}