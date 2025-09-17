/**
 * Centralized configuration for the learning pathway component
 * All spacing, dimensions, and behavior constants are defined here
 */

export interface PathwayConfig {
  spacing: {
    lesson: number;
    graduation_buffer: number;
    start_offset: number;
    side_offset: number;
    end_padding: number;
  };
  container: {
    width: number;
    max_width: string;
    min_height_padding: number;
  };
  viewport: {
    lessons_per_screen: number;
    scroll_position_ratio: number;
    auto_scroll_delay: number;
  };
  visual: {
    path_stroke_width: number;
    path_opacity: number;
    node_sizes: {
      xs: { width: number; height: number; fontSize: string };
      md: { width: number; height: number; fontSize: string };
    };
  };
  scalability: {
    max_lessons_before_virtualization: number;
    adaptive_spacing_threshold: number;
    min_spacing: number;
    max_container_height: number;
  };
}

export const PATHWAY_CONFIG: PathwayConfig = {
  spacing: {
    lesson: 250,              // Base spacing between lessons
    graduation_buffer: 60,    // Buffer around graduation elements
    start_offset: 120,        // Starting Y position
    side_offset: 120,         // Distance from center for alternating text
    end_padding: 200,         // Bottom padding
  },
  container: {
    width: 600,               // Fixed container width
    max_width: '600px',       // CSS max-width
    min_height_padding: 300,  // Base padding for height calculations
  },
  viewport: {
    lessons_per_screen: 3,    // Target lessons visible per viewport
    scroll_position_ratio: 1/3, // Position current lesson at 1/3 from top
    auto_scroll_delay: 100,   // Delay for smooth auto-scroll
  },
  visual: {
    path_stroke_width: 24,    // SVG path thickness
    path_opacity: 0.6,        // Path transparency
    node_sizes: {
      xs: { width: 46, height: 46, fontSize: '0.9rem' },
      md: { width: 58, height: 58, fontSize: '1.1rem' },
    },
  },
  scalability: {
    max_lessons_before_virtualization: 50,  // When to enable virtual scrolling
    adaptive_spacing_threshold: 20,         // When to start reducing spacing
    min_spacing: 150,                       // Minimum spacing allowed
    max_container_height: 10000,            // Maximum container height (px)
  },
};

/**
 * Calculate adaptive spacing based on lesson count
 */
export function getAdaptiveSpacing(lessonCount: number): number {
  const { spacing, scalability } = PATHWAY_CONFIG;
  
  if (lessonCount <= scalability.adaptive_spacing_threshold) {
    return spacing.lesson;
  }
  
  // Gradually reduce spacing as lesson count increases
  const reduction = Math.min(
    (lessonCount - scalability.adaptive_spacing_threshold) * 5,
    spacing.lesson - scalability.min_spacing
  );
  
  return Math.max(spacing.lesson - reduction, scalability.min_spacing);
}

/**
 * Check if virtualization should be enabled
 */
export function shouldUseVirtualization(lessonCount: number): boolean {
  return lessonCount > PATHWAY_CONFIG.scalability.max_lessons_before_virtualization;
}

/**
 * Calculate optimal viewport configuration based on screen size
 */
export function getViewportConfig(screenHeight: number) {
  const baseConfig = PATHWAY_CONFIG.viewport;
  
  // Adjust lessons per screen based on available height
  const lessonsPerScreen = Math.max(
    2,
    Math.floor(screenHeight / getAdaptiveSpacing(1) * 0.8)
  );
  
  return {
    ...baseConfig,
    lessons_per_screen: Math.min(lessonsPerScreen, 5), // Cap at 5 lessons max
  };
}