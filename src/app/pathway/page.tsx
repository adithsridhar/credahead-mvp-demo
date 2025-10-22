'use client';

import { isFeatureEnabled } from '@/lib/featureFlags';
import ComingSoon from '@/components/ComingSoon';

export default function PathwayPage() {
  // Check if pathway feature is enabled
  if (!isFeatureEnabled('learningPathway')) {
    return (
      <ComingSoon 
        feature="Learning Pathway"
        description="The interactive learning pathway with visual progress tracking and lesson management is currently under development. This feature will provide a comprehensive view of your financial literacy journey with step-by-step lessons and progress tracking."
      />
    );
  }

  // Feature is enabled - this code will be restored when feature flag is turned on
  return null;
}