'use client';

import React, { memo, useMemo } from 'react';
import { Box, Typography } from '@mui/material';
import { CheckCircle, Lock } from '@mui/icons-material';
import { type LessonWithProgress } from '@/lib/pathwayGeneration';
import { PATHWAY_CONFIG } from './pathwayConfig';
import { 
  calculateLessonPosition, 
  calculateLessonTextPosition,
  type PathwayDimensions 
} from './pathwayUtils';

interface OptimizedLessonNodeProps {
  lesson: LessonWithProgress;
  state: 'completed' | 'next' | 'available' | 'locked';
  onClick: () => void;
  lessonIndex: number;
  dimensions: PathwayDimensions;
  isVisible: boolean;
}

const OptimizedLessonNode = memo(function OptimizedLessonNode({ 
  lesson, 
  state, 
  onClick,
  lessonIndex,
  dimensions,
  isVisible
}: OptimizedLessonNodeProps) {
  // Memoized position calculations
  const { nodePosition, textPosition } = useMemo(() => {
    const nodePos = calculateLessonPosition(lessonIndex, dimensions);
    const textPos = calculateLessonTextPosition(lessonIndex, nodePos);
    return {
      nodePosition: nodePos,
      textPosition: textPos,
    };
  }, [lessonIndex, dimensions]);

  // Memoized styles
  const nodeStyles = useMemo(() => {
    const nodeSize = PATHWAY_CONFIG.visual.node_sizes;
    
    const baseStyles = {
      ...nodeSize,
      borderRadius: '50%',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      cursor: state === 'locked' ? 'not-allowed' : 'pointer',
      transition: 'all 0.3s ease',
      border: '2px solid',
      fontWeight: 'bold',
      position: 'absolute' as const,
      left: `${nodePosition.x}px`,
      top: `${nodePosition.y}px`,
      transform: 'translate(-50%, -50%)',
      zIndex: 10,
      boxShadow: '0 6px 20px rgba(0,0,0,0.3), inset 0 1px 0 rgba(255,255,255,0.3), inset 0 -1px 0 rgba(0,0,0,0.1)',
      '&:hover': state !== 'locked' ? {
        transform: 'translate(-50%, -50%) scale(1.1)',
        boxShadow: '0 8px 25px rgba(0,0,0,0.4), inset 0 1px 0 rgba(255,255,255,0.4), inset 0 -1px 0 rgba(0,0,0,0.2)',
      } : {},
    };

    switch (state) {
      case 'completed':
        return {
          ...baseStyles,
          background: 'radial-gradient(circle at 30% 30%, #34D399, #10B981, #047857)',
          borderColor: '#059669',
          color: 'white',
        };
      case 'next':
        return {
          ...baseStyles,
          background: 'radial-gradient(circle at 30% 30%, #FB923C, #FF6B35, #DC2626)',
          borderColor: '#E55A2B',
          color: 'white',
          animation: 'pulse 2s infinite',
        };
      case 'available':
        return {
          ...baseStyles,
          background: 'radial-gradient(circle at 30% 30%, #60A5FA, #2B5CE6, #1E40AF)',
          borderColor: '#1E40AF',
          color: 'white',
        };
      case 'locked':
        return {
          ...baseStyles,
          background: 'radial-gradient(circle at 30% 30%, #9CA3AF, #6B7280, #4B5563)',
          borderColor: '#4B5563',
          color: '#E5E7EB',
          opacity: 0.7,
        };
      default:
        return baseStyles;
    }
  }, [state, nodePosition]);

  const textStyles = useMemo(() => ({
    position: 'absolute' as const,
    top: `${textPosition.y}px`,
    left: `${textPosition.x}px`,
    transform: 'translate(-50%, -50%)',
    maxWidth: '180px',
    zIndex: 5,
    textAlign: 'center' as const,
  }), [textPosition]);

  // Memoized content
  const nodeContent = useMemo(() => {
    if (state === 'completed') {
      return <CheckCircle sx={{ fontSize: { xs: '1.2rem', md: '1.5rem' } }} />;
    }
    if (state === 'locked') {
      return <Lock sx={{ fontSize: { xs: '1rem', md: '1.2rem' } }} />;
    }
    return (
      <Typography 
        variant="h6" 
        sx={{ 
          fontSize: PATHWAY_CONFIG.visual.node_sizes.xs.fontSize,
          fontWeight: 'bold',
          '@media (min-width: 768px)': {
            fontSize: PATHWAY_CONFIG.visual.node_sizes.md.fontSize,
          }
        }}
      >
        {lesson.level}
      </Typography>
    );
  }, [state, lesson.level]);

  // Don't render if not visible (for performance)
  if (!isVisible) {
    return null;
  }

  return (
    <>
      {/* Lesson Node */}
      <Box
        onClick={onClick}
        sx={nodeStyles}
        data-lesson-id={lesson.lesson_id}
        data-lesson-index={lessonIndex}
      >
        {nodeContent}
      </Box>

      {/* Lesson Text */}
      <Box sx={textStyles}>
        <Typography
          sx={{
            color: state === 'locked' ? '#6B7280' : '#E0E0E0',
            fontSize: { xs: '1rem', md: '1.1rem' },
            fontWeight: 'bold',
            opacity: state === 'locked' ? 0.7 : 1,
            lineHeight: 1.3,
            textAlign: 'center',
            display: '-webkit-box',
            WebkitLineClamp: 2,
            WebkitBoxOrient: 'vertical',
            overflow: 'hidden',
            textShadow: '0 1px 3px rgba(0,0,0,0.7)',
          }}
        >
          {lesson.title}
        </Typography>
      </Box>

      {/* Pulse animation styles */}
      {state === 'next' && (
        <style jsx>{`
          @keyframes pulse {
            0% { box-shadow: 0 4px 12px rgba(255, 107, 53, 0.4); }
            50% { box-shadow: 0 6px 20px rgba(255, 107, 53, 0.8); }
            100% { box-shadow: 0 4px 12px rgba(255, 107, 53, 0.4); }
          }
        `}</style>
      )}
    </>
  );
});

// Custom comparison function for memo
function arePropsEqual(
  prevProps: OptimizedLessonNodeProps, 
  nextProps: OptimizedLessonNodeProps
): boolean {
  return (
    prevProps.lesson.lesson_id === nextProps.lesson.lesson_id &&
    prevProps.lesson.status === nextProps.lesson.status &&
    prevProps.lesson.title === nextProps.lesson.title &&
    prevProps.lesson.level === nextProps.lesson.level &&
    prevProps.state === nextProps.state &&
    prevProps.lessonIndex === nextProps.lessonIndex &&
    prevProps.isVisible === nextProps.isVisible &&
    prevProps.dimensions.spacing === nextProps.dimensions.spacing &&
    prevProps.dimensions.containerWidth === nextProps.dimensions.containerWidth
  );
}

export default memo(OptimizedLessonNode, arePropsEqual);