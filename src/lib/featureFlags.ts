/**
 * Feature flags for enabling/disabling features
 * Set to false to disable secondary features for production release
 */

export interface FeatureFlags {
  /** Enable learning pathway visualization system */
  learningPathway: boolean;
  /** Enable individual lesson quizzes */
  lessonQuizzes: boolean;
  /** Enable pathway visual components (highway, animations) */
  pathwayVisualizations: boolean;
  /** Enable advanced performance optimizations */
  advancedOptimizations: boolean;
}

export const featureFlags: FeatureFlags = {
  // Secondary features - disabled for primary release
  learningPathway: false,
  lessonQuizzes: false, 
  pathwayVisualizations: false,
  advancedOptimizations: false,
};

/**
 * Check if a feature is enabled
 */
export function isFeatureEnabled(feature: keyof FeatureFlags): boolean {
  return featureFlags[feature];
}

/**
 * For development/testing - enable all features
 */
export function enableAllFeatures(): void {
  Object.keys(featureFlags).forEach(key => {
    (featureFlags as any)[key] = true;
  });
}

/**
 * For production - disable secondary features
 */
export function enablePrimaryFeaturesOnly(): void {
  featureFlags.learningPathway = false;
  featureFlags.lessonQuizzes = false;
  featureFlags.pathwayVisualizations = false;
  featureFlags.advancedOptimizations = false;
}