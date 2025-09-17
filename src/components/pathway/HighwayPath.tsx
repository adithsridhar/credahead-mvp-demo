'use client';

import { Box } from '@mui/material';
import { PATHWAY_CONFIG } from './pathwayConfig';
import { 
  generatePathData, 
  calculateLessonPosition, 
  calculateGraduationPosition,
  type PathwayDimensions 
} from './pathwayUtils';

interface HighwayPathProps {
  dimensions: PathwayDimensions;
  graduationPositions?: number[];
}

// Legacy function for backward compatibility
export const generateHighwayPath = (height: number, width: number, graduationPositions: number[] = []) => {
  const dimensions: PathwayDimensions = {
    containerHeight: height,
    containerWidth: width,
    totalElements: 0,
    spacing: PATHWAY_CONFIG.spacing.lesson,
  };
  return generatePathData(dimensions, graduationPositions);
};

// Updated function using centralized utilities
export const getPathCoordinates = (lessonIndex: number, totalLessons: number, width: number, height: number): { x: number, y: number } => {
  const dimensions: PathwayDimensions = {
    containerHeight: height,
    containerWidth: width,
    totalElements: totalLessons,
    spacing: PATHWAY_CONFIG.spacing.lesson,
  };
  
  const position = calculateLessonPosition(lessonIndex, dimensions);
  return { x: position.x, y: position.y };
};

// Updated function using centralized utilities  
export const getGraduationPosition = (lessonIndex: number, totalLessons: number, width: number, height: number): { x: number, y: number } => {
  const dimensions: PathwayDimensions = {
    containerHeight: height,
    containerWidth: width,
    totalElements: totalLessons,
    spacing: PATHWAY_CONFIG.spacing.lesson,
  };
  
  const position = calculateGraduationPosition(0, lessonIndex, dimensions);
  return { x: position.x, y: position.y };
};

export default function HighwayPath({ dimensions, graduationPositions = [] }: HighwayPathProps) {
  const pathData = generatePathData(dimensions, graduationPositions);
  const { visual } = PATHWAY_CONFIG;

  return (
    <Box
      sx={{
        position: 'absolute',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        zIndex: 1,
        pointerEvents: 'none',
      }}
    >
      <svg
        width={dimensions.containerWidth}
        height={dimensions.containerHeight}
        style={{ position: 'absolute', top: 0, left: 0 }}
      >
        <path
          d={pathData}
          stroke={`rgba(255, 255, 255, ${visual.path_opacity})`}
          fill="none"
          strokeWidth={visual.path_stroke_width}
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    </Box>
  );
}