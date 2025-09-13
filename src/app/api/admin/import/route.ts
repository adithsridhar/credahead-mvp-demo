import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

interface LessonRow {
  lesson_id: string;
  title: string;
  description?: string;
  learning_outcomes?: string;
  level: number;
  estimated_duration?: number;
  prerequisites?: string;
  completion_rate?: number;
  avg_quiz_score?: number;
}

interface QuestionRow {
  question_id: string;
  lesson_id?: string;
  text: string;
  options: string;
  correct_answer: number;
  difficulty: number;
  explanation?: string;
  tags?: string;
}

function parseCSV(csvText: string): any[] {
  const lines = csvText.trim().split('\n');
  if (lines.length < 2) return [];

  const headers = lines[0].split(',').map(h => h.trim().replace(/"/g, ''));
  const rows = [];

  for (let i = 1; i < lines.length; i++) {
    const values = lines[i].split(',').map(v => v.trim().replace(/"/g, ''));
    const row: any = {};
    
    headers.forEach((header, index) => {
      if (values[index] !== undefined) {
        row[header] = values[index];
      }
    });
    
    rows.push(row);
  }

  return rows;
}

function transformLessons(rows: any[]): LessonRow[] {
  return rows.map(row => ({
    lesson_id: row.lesson_id,
    title: row.title,
    description: row.description || null,
    learning_outcomes: row.learning_outcomes ? JSON.parse(row.learning_outcomes) : null,
    level: parseInt(row.level) || 1,
    estimated_duration: row.estimated_duration ? parseInt(row.estimated_duration) : null,
    prerequisites: row.prerequisites ? row.prerequisites.split(';') : [],
    completion_rate: row.completion_rate ? parseFloat(row.completion_rate) : 0,
    avg_quiz_score: row.avg_quiz_score ? parseFloat(row.avg_quiz_score) : 0,
  }));
}

function transformQuestions(rows: any[]): QuestionRow[] {
  return rows.map(row => ({
    question_id: row.question_id,
    lesson_id: row.lesson_id || null,
    text: row.text,
    options: JSON.parse(row.options || '[]'),
    correct_answer: parseInt(row.correct_answer) || 0,
    difficulty: parseInt(row.difficulty) || 5,
    explanation: row.explanation || null,
    tags: row.tags ? row.tags.split(';') : [],
  }));
}

export async function POST(request: NextRequest) {
  try {
    // Create admin client in server environment
    const supabaseAdmin = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!,
      {
        auth: {
          autoRefreshToken: false,
          persistSession: false
        }
      }
    );

    const formData = await request.formData();
    const file = formData.get('file') as File;
    const type = formData.get('type') as 'lessons' | 'questions';

         if (!file) {
           return NextResponse.json({ error: 'No file provided' }, { status: 400 });
         }

         if (!type || (type !== 'lessons' && type !== 'questions')) {
           return NextResponse.json({ error: 'Invalid type. Must be "lessons" or "questions"' }, { status: 400 });
         }

         const csvText = await file.text();
         const parsed = parseCSV(csvText);

         if (parsed.length === 0) {
      return NextResponse.json({ error: 'No data found in CSV' }, { status: 400 });
    }

    let transformedData;
    if (type === 'lessons') {
      transformedData = transformLessons(parsed);
    } else {
      transformedData = transformQuestions(parsed);
    }

    // Insert in batches
    const batchSize = type === 'lessons' ? 100 : 500;
    let totalImported = 0;
    
    for (let i = 0; i < transformedData.length; i += batchSize) {
      const batch = transformedData.slice(i, i + batchSize);
      
      const { error, count } = await supabaseAdmin
        .from(type)
        .insert(batch)
        .select('*', { count: 'exact' });

      if (error) {
        console.error(`Error inserting batch ${i}-${i + batch.length}:`, error);
        return NextResponse.json({ 
          error: `Failed to import batch: ${error.message}`,
          imported: totalImported
        }, { status: 500 });
      }

      totalImported += count || batch.length;
    }

    return NextResponse.json({ 
      success: true, 
      imported: totalImported,
      type 
    });

  } catch (error: any) {
    console.error('Import error:', error);
    return NextResponse.json({ 
      error: error.message || 'Failed to import data' 
    }, { status: 500 });
  }
}
