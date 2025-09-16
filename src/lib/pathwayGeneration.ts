import { supabase, type Lesson, type UserProgress } from '@/lib/supabase';

export interface LessonWithProgress extends Lesson {
  status: 'completed' | 'available' | 'locked';
  isLocked: boolean;
  lockReason?: string | null;
  userProgress?: UserProgress;
}

export async function generatePathway(userId: string, userLiteracyLevel: number): Promise<LessonWithProgress[]> {
  try {
    // Get user's current literacy level to ensure we have the most up-to-date level
    const { data: userData } = await supabase
      .from('users')
      .select('literacy_level')
      .eq('id', userId)
      .single();
    
    const currentLiteracyLevel = userData?.literacy_level || userLiteracyLevel;

    // Fetch only lessons >= user's literacy level (hide lower level lessons)
    const { data: lessons, error: lessonsError } = await supabase
      .from('lessons')
      .select('*')
      .gte('level', currentLiteracyLevel) // Only include lessons at or above user's literacy level
      .order('level', { ascending: true })
      .order('lesson_id', { ascending: true });

    if (lessonsError) {
      console.error('Error fetching lessons:', lessonsError);
      return [];
    }

    if (!lessons || lessons.length === 0) {
      console.log('No lessons found for literacy level:', currentLiteracyLevel);
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

    // Determine the user's current pathway level (the level they can currently access)
    let currentAccessibleLevel = currentLiteracyLevel;
    
    // Check if all lessons at current accessible level are completed
    const currentLevelLessons = lessons.filter(l => l.level === currentAccessibleLevel);
    if (currentLevelLessons.length > 0) {
      const allCurrentLevelCompleted = currentLevelLessons.every(l => 
        completedLessons.has(l.lesson_id)
      );
      
      if (allCurrentLevelCompleted) {
        // Find the next level that has lessons
        const nextLevel = Math.min(...lessons.filter(l => l.level > currentAccessibleLevel).map(l => l.level));
        if (nextLevel !== Infinity) {
          currentAccessibleLevel = nextLevel;
        }
      }
    }

    // Build pathway with proper status
    return lessons.map(lesson => {
      const userProgress = progressMap.get(lesson.lesson_id);
      const isCompleted = completedLessons.has(lesson.lesson_id);
      
      // Determine lesson accessibility
      let status: 'completed' | 'available' | 'locked';
      let isLocked = false;
      let lockReason: string | null = null;

      if (isCompleted) {
        status = 'completed';
      } else if (lesson.level > currentAccessibleLevel) {
        // Lesson is from a higher level - locked until current level completed
        status = 'locked';
        isLocked = true;
        lockReason = `Complete all Level ${currentAccessibleLevel} lessons first`;
      } else if (lesson.level === currentAccessibleLevel) {
        // For current level, check prerequisites (ignore lower level ones)
        const relevantPrereqs = (lesson.prerequisites || []).filter((prereq: string) => {
          // We'll do a simple check here - if it's not completed, assume it's required
          // The more complex logic is better handled in a separate validation step
          return !completedLessons.has(prereq);
        });
        
        if (relevantPrereqs.length > 0) {
          status = 'locked';
          isLocked = true;
          lockReason = `Prerequisites required: ${relevantPrereqs.join(', ')}`;
        } else {
          status = 'available';
        }
      } else {
        // This shouldn't happen since we filter out lower levels, but just in case
        status = 'available';
      }

      return {
        ...lesson,
        status,
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

// Helper function to filter prerequisites based on level
async function getRelevantPrerequisites(
  prerequisites: string[], 
  userLiteracyLevel: number
): Promise<string[]> {
  if (!prerequisites || prerequisites.length === 0) {
    return [];
  }

  try {
    // Fetch levels for all prerequisites
    const { data: prereqLessons } = await supabase
      .from('lessons')
      .select('lesson_id, level')
      .in('lesson_id', prerequisites);

    if (!prereqLessons) {
      return prerequisites; // If can't fetch, include all prerequisites
    }

    // Filter out prerequisites below user's literacy level
    return prereqLessons
      .filter(lesson => lesson.level >= userLiteracyLevel)
      .map(lesson => lesson.lesson_id);
  } catch (error) {
    console.warn('Could not filter prerequisites by level:', error);
    return prerequisites; // If error, include all prerequisites
  }
}

// Legacy function for backwards compatibility
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
    // Get user's current literacy level
    const { data: userData } = await supabase
      .from('users')
      .select('literacy_level')
      .eq('id', userId)
      .single();

    if (!userData) return;
    
    const currentLiteracyLevel = userData.literacy_level;

    // Get all lessons at or above user's literacy level
    const { data: allEligibleLessons } = await supabase
      .from('lessons')
      .select('lesson_id, level')
      .gte('level', currentLiteracyLevel);

    if (!allEligibleLessons) return;

    // Get user's completed lessons
    const { data: progress } = await supabase
      .from('user_progress')
      .select('lesson_id')
      .eq('user_id', userId)
      .eq('completed', true);

    if (!progress) return;

    const completedLessonIds = new Set(progress.map(p => p.lesson_id));

    // Group lessons by level and check completion
    const levelCompletion = new Map<number, { completed: number; total: number }>();
    
    allEligibleLessons.forEach(lesson => {
      const level = lesson.level;
      if (!levelCompletion.has(level)) {
        levelCompletion.set(level, { completed: 0, total: 0 });
      }
      levelCompletion.get(level)!.total++;
      
      if (completedLessonIds.has(lesson.lesson_id)) {
        levelCompletion.get(level)!.completed++;
      }
    });

    // Find the highest level where all lessons are completed
    let newLiteracyLevel = currentLiteracyLevel;
    
    // Check each level starting from current to see if it's fully completed
    const availableLevels = Array.from(levelCompletion.keys()).sort((a, b) => a - b);
    
    for (const level of availableLevels) {
      const completion = levelCompletion.get(level)!;
      if (completion.completed === completion.total && completion.total > 0) {
        // This level is fully completed, user can advance
        newLiteracyLevel = Math.max(newLiteracyLevel, level + 1);
      } else {
        // This level is not completed, stop here
        break;
      }
    }

    // Update user's literacy level if it has increased
    if (newLiteracyLevel > currentLiteracyLevel) {
      await supabase
        .from('users')
        .update({
          literacy_level: newLiteracyLevel,
          current_pathway_level: newLiteracyLevel,
        })
        .eq('id', userId);
        
      console.log(`User literacy level updated from ${currentLiteracyLevel} to ${newLiteracyLevel}`);
    }

  } catch (error) {
    console.error('Error updating literacy level:', error);
  }
}