/**
 * Centralized calculation utilities for the learning pathway
 * All positioning, sizing, and layout calculations are handled here
 */

import { PATHWAY_CONFIG, getAdaptiveSpacing, type PathwayConfig } from './pathwayConfig';
import { type LessonWithProgress } from '@/lib/pathwayGeneration';

export interface PathwayDimensions {
  containerHeight: number;
  containerWidth: number;
  totalElements: number;
  spacing: number;
}

export interface ElementPosition {
  x: number;
  y: number;
  index: number;
}

export interface GraduationInfo {
  positions: number[];
  indices: number[];
  count: number;
}

/**
 * Calculate total pathway dimensions based on lessons
 */
export function calculatePathwayDimensions(lessons: LessonWithProgress[]): PathwayDimensions {
  const spacing = getAdaptiveSpacing(lessons.length);
  const graduationCount = countGraduations(lessons);
  const totalElements = lessons.length + graduationCount;
  
  const containerHeight = Math.min(
    PATHWAY_CONFIG.container.min_height_padding + (totalElements * spacing),
    PATHWAY_CONFIG.scalability.max_container_height
  );

  return {
    containerHeight,
    containerWidth: PATHWAY_CONFIG.container.width,
    totalElements,
    spacing,
  };
}

/**
 * Calculate lesson node position
 */
export function calculateLessonPosition(
  lessonIndex: number,
  dimensions: PathwayDimensions
): ElementPosition {
  const { spacing } = dimensions;
  const centerX = dimensions.containerWidth / 2;
  const startY = PATHWAY_CONFIG.spacing.start_offset;

  return {
    x: centerX,
    y: startY + (lessonIndex * spacing),
    index: lessonIndex,
  };
}

/**
 * Calculate graduation element position
 */
export function calculateGraduationPosition(
  graduationIndex: number,
  lessonIndex: number,
  dimensions: PathwayDimensions
): ElementPosition {
  const { spacing } = dimensions;
  const centerX = dimensions.containerWidth / 2;
  const startY = PATHWAY_CONFIG.spacing.start_offset;
  
  // Position graduation between lessons
  const effectiveIndex = lessonIndex + 0.5;

  return {
    x: centerX,
    y: startY + (effectiveIndex * spacing),
    index: graduationIndex,
  };
}

/**
 * Calculate lesson text position (alternating sides)
 */
export function calculateLessonTextPosition(
  lessonIndex: number,
  lessonPosition: ElementPosition
): ElementPosition {
  const isEven = lessonIndex % 2 === 0;
  const sideOffset = PATHWAY_CONFIG.spacing.side_offset;
  
  return {
    x: isEven 
      ? lessonPosition.x - sideOffset 
      : lessonPosition.x + sideOffset,
    y: lessonPosition.y,
    index: lessonIndex,
  };
}

/**
 * Get graduation information from lessons
 */
export function getGraduationInfo(lessons: LessonWithProgress[]): GraduationInfo {
  const positions: number[] = [];
  const indices: number[] = [];
  
  lessons.forEach((lesson, index) => {
    const nextLesson = lessons[index + 1];
    if (nextLesson && nextLesson.level !== lesson.level) {
      const dimensions = calculatePathwayDimensions(lessons);
      const position = calculateGraduationPosition(positions.length, index, dimensions);
      positions.push(position.y);
      indices.push(index);
    }
  });

  return {
    positions,
    indices,
    count: positions.length,
  };
}

/**
 * Count graduation elements between lessons
 */
function countGraduations(lessons: LessonWithProgress[]): number {
  return lessons.reduce((count, lesson, index) => {
    const nextLesson = lessons[index + 1];
    return nextLesson && nextLesson.level !== lesson.level ? count + 1 : count;
  }, 0);
}

/**
 * Generate SVG path data with breaks around graduations
 */
export function generatePathData(
  dimensions: PathwayDimensions,
  graduationPositions: number[]
): string {
  const centerX = dimensions.containerWidth / 2;
  const pathStart = PATHWAY_CONFIG.spacing.start_offset;
  const pathEnd = dimensions.containerHeight - PATHWAY_CONFIG.spacing.end_padding;
  const buffer = PATHWAY_CONFIG.spacing.graduation_buffer;

  if (graduationPositions.length === 0) {
    return `M ${centerX} ${pathStart} L ${centerX} ${pathEnd}`;
  }

  let pathData = '';
  let currentY = pathStart;

  graduationPositions.forEach((graduationY) => {
    const beforeGraduation = graduationY - buffer;
    
    if (currentY < beforeGraduation) {
      if (pathData === '') {
        pathData = `M ${centerX} ${currentY} L ${centerX} ${beforeGraduation}`;
      } else {
        pathData += ` M ${centerX} ${currentY} L ${centerX} ${beforeGraduation}`;
      }
    }
    
    currentY = graduationY + buffer;
  });

  if (currentY < pathEnd) {
    pathData += ` M ${centerX} ${currentY} L ${centerX} ${pathEnd}`;
  }

  return pathData;
}

/**
 * Calculate optimal scroll position for a lesson
 */
export function calculateScrollPosition(
  lessonIndex: number,
  containerHeight: number,
  dimensions: PathwayDimensions
): number {
  const lessonPosition = calculateLessonPosition(lessonIndex, dimensions);
  const scrollRatio = PATHWAY_CONFIG.viewport.scroll_position_ratio;
  
  return Math.max(0, lessonPosition.y - (containerHeight * scrollRatio));
}

/**
 * Check if an element is in viewport
 */
export function isElementInViewport(
  elementY: number,
  scrollTop: number,
  viewportHeight: number
): boolean {
  return elementY >= scrollTop && elementY <= scrollTop + viewportHeight;
}

/**
 * Get visible lesson indices for virtual scrolling
 */
export function getVisibleLessonIndices(
  lessons: LessonWithProgress[],
  scrollTop: number,
  viewportHeight: number,
  dimensions: PathwayDimensions,
  buffer: number = 2
): { start: number; end: number } {
  const { spacing } = dimensions;
  const startY = PATHWAY_CONFIG.spacing.start_offset;
  
  // Calculate which lessons are potentially visible
  const firstVisibleIndex = Math.max(0, 
    Math.floor((scrollTop - startY) / spacing) - buffer
  );
  
  const lastVisibleIndex = Math.min(lessons.length - 1,
    Math.ceil((scrollTop + viewportHeight - startY) / spacing) + buffer
  );

  return {
    start: firstVisibleIndex,
    end: lastVisibleIndex,
  };
}