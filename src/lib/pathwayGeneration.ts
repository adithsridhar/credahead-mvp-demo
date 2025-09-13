import { supabase, type Lesson, type UserProgress } from '@/lib/supabase';

export interface LessonWithProgress extends Lesson {
  status: 'completed' | 'available' | 'locked';
  isLocked: boolean;
  lockReason?: string | null;
  userProgress?: UserProgress;
}

export async function generatePathway(userId: string, literacyLevel: number): Promise<LessonWithProgress[]> {
  try {
    // Fetch all lessons ordered by level and lesson_id
    const { data: lessons, error: lessonsError } = await supabase
      .from('lessons')
      .select('*')
      .order('level', { ascending: true })
      .order('lesson_id', { ascending: true });

    if (lessonsError) {
      console.error('Error fetching lessons:', lessonsError);
      return [];
    }

    // Fetch user's progress
    const { data: progress, error: progressError } = await supabase
      .from('user_progress')
      .select('*')
      .eq('user_id', userId);

    if (progressError) {
      console.error('Error fetching progress:', progressError);
    }

    const progressMap = new Map(
      (progress || []).map(p => [p.lesson_id, p])
    );

    const completedLessons = new Set(
      (progress || []).filter(p => p.completed).map(p => p.lesson_id)
    );

    // Check if all lessons at current level are completed
    const currentLevelLessons = lessons?.filter(l => l.level === literacyLevel) || [];
    const currentLevelCompleted = currentLevelLessons.every(l => 
      completedLessons.has(l.lesson_id)
    );

    // Determine max accessible level
    const maxAccessibleLevel = currentLevelCompleted ? literacyLevel + 1 : literacyLevel;

    // Build pathway with status
    return (lessons || []).map(lesson => {
      const userProgress = progressMap.get(lesson.lesson_id);
      const isCompleted = completedLessons.has(lesson.lesson_id);
      const isLevelLocked = lesson.level > maxAccessibleLevel;
      const hasUnmetPrerequisites = !checkPrerequisites(lesson.prerequisites || [], completedLessons);

      const isLocked = isLevelLocked || hasUnmetPrerequisites;
      
      let lockReason = null;
      if (isLevelLocked) {
        lockReason = `Complete all Level ${literacyLevel} lessons first`;
      } else if (hasUnmetPrerequisites) {
        const unmetPrereqs = (lesson.prerequisites || []).filter(prereq => 
          !completedLessons.has(prereq)
        );
        lockReason = `Prerequisites required: ${unmetPrereqs.join(', ')}`;
      }

      return {
        ...lesson,
        status: isCompleted ? 'completed' : 
                isLocked ? 'locked' : 'available',
        isLocked,
        lockReason,
        userProgress,
      } as LessonWithProgress;
    });
  } catch (error) {
    console.error('Error generating pathway:', error);
    return [];
  }
}

function checkPrerequisites(prerequisites: string[], completedLessons: Set<string>): boolean {
  return prerequisites.every(prereq => completedLessons.has(prereq));
}

export async function getLessonProgress(userId: string, lessonId: string): Promise<UserProgress | null> {
  try {
    const { data, error } = await supabase
      .from('user_progress')
      .select('*')
      .eq('user_id', userId)
      .eq('lesson_id', lessonId)
      .maybeSingle();

    if (error) {
      console.error('Error fetching lesson progress:', error);
      return null;
    }

    return data;
  } catch (error) {
    console.error('Error fetching lesson progress:', error);
    return null;
  }
}

export async function updateUserLiteracyLevel(userId: string): Promise<void> {
  try {
    // Get user's completed lessons
    const { data: progress } = await supabase
      .from('user_progress')
      .select('lesson_id, score')
      .eq('user_id', userId)
      .eq('completed', true);

    if (!progress || progress.length === 0) return;

    // Get lessons to determine levels
    const { data: lessons } = await supabase
      .from('lessons')
      .select('lesson_id, level')
      .in('lesson_id', progress.map(p => p.lesson_id));

    if (!lessons) return;

    const lessonLevelMap = new Map(lessons.map(l => [l.lesson_id, l.level]));

    // Group by level and check completion
    const levelCompletion = new Map<number, { completed: number; total: number }>();
    
    lessons.forEach(lesson => {
      const level = lesson.level;
      if (!levelCompletion.has(level)) {
        levelCompletion.set(level, { completed: 0, total: 0 });
      }
      levelCompletion.get(level)!.total++;
    });

    progress.forEach(p => {
      const level = lessonLevelMap.get(p.lesson_id);
      if (level && levelCompletion.has(level)) {
        levelCompletion.get(level)!.completed++;
      }
    });

    // Find highest completed level
    let highestLevel = 1;
    for (let level = 10; level >= 1; level--) {
      const completion = levelCompletion.get(level);
      if (completion && completion.completed === completion.total && completion.total > 0) {
        highestLevel = level;
        break;
      }
    }

    // Update user's literacy level
    await supabase
      .from('users')
      .update({
        literacy_level: highestLevel,
        current_pathway_level: Math.min(highestLevel + 1, 10),
      })
      .eq('id', userId);

  } catch (error) {
    console.error('Error updating literacy level:', error);
  }
}