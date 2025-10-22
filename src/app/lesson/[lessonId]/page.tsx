'use client';

import { isFeatureEnabled } from '@/lib/featureFlags';
import ComingSoon from '@/components/ComingSoon';

export default function LessonQuizPage() {
  // Check if lesson quiz feature is enabled
  if (!isFeatureEnabled('lessonQuizzes')) {
    return (
      <ComingSoon 
        feature="Lesson Quizzes"
        description="Individual lesson quizzes with adaptive difficulty and detailed feedback are currently under development. This feature will provide targeted practice for specific financial literacy topics with personalized learning paths."
      />
    );
  }

  // Feature is enabled - this code will be restored when feature flag is turned on
  return null;
}