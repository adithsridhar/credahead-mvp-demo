'use client';

import { Box, Typography } from '@mui/material';
import { CheckCircle, Lock } from '@mui/icons-material';
import { type LessonWithProgress } from '@/lib/pathwayGeneration';
import { PATHWAY_CONFIG } from './pathwayConfig';
import { 
  calculateLessonPosition, 
  calculateLessonTextPosition,
  type PathwayDimensions 
} from './pathwayUtils';
import { getPathCoordinates } from './HighwayPath'; // Keep for backward compatibility

interface HighwayLessonNodeProps {
  lesson: LessonWithProgress;
  state: 'completed' | 'next' | 'available' | 'locked';
  onClick: () => void;
  lessonIndex: number;
  dimensions: PathwayDimensions;
  // Legacy props for backward compatibility
  totalLessons?: number;
  containerWidth?: number;
  containerHeight?: number;
}

export default function HighwayLessonNode({ 
  lesson, 
  state, 
  onClick,
  lessonIndex,
  dimensions,
  // Legacy props
  totalLessons,
  containerWidth = 600,
  containerHeight = 2000
}: HighwayLessonNodeProps) {
  // Calculate position using new centralized utilities
  const pathCoords = calculateLessonPosition(lessonIndex, dimensions);
  
  const getNodeStyles = () => {
    const baseStyles = {
      width: { xs: 46, md: 58 },
      height: { xs: 46, md: 58 },
      borderRadius: '50%',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      cursor: state === 'locked' ? 'not-allowed' : 'pointer',
      transition: 'all 0.3s ease',
      border: '2px solid',
      fontWeight: 'bold',
      position: 'absolute' as const,
      left: `${pathCoords.x}px`,
      top: `${pathCoords.y}px`,
      transform: 'translate(-50%, -50%)',
      zIndex: 10,
      // 3D sphere effect with gradients and shadows
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
  };

  const getTextStyles = () => {
    // Calculate text position using centralized utility
    const textPosition = calculateLessonTextPosition(lessonIndex, pathCoords);
    
    return {
      position: 'absolute' as const,
      top: `${textPosition.y}px`,
      left: `${textPosition.x}px`,
      transform: 'translate(-50%, -50%)',
      maxWidth: '180px',
      zIndex: 5,
      textAlign: 'center' as const,
    };
  };


  const renderNodeContent = () => {
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
          fontSize: { xs: '0.9rem', md: '1.1rem' },
          fontWeight: 'bold' 
        }}
      >
        {lesson.level}
      </Typography>
    );
  };

  return (
    <>
      {/* Lesson Node - positioned on curved path */}
      <Box
        onClick={onClick}
        sx={getNodeStyles()}
      >
        {renderNodeContent()}
      </Box>

      {/* Lesson Text - positioned on alternating sides */}
      <Box sx={getTextStyles()}>
        <Typography
          sx={{
            color: state === 'locked' ? '#6B7280' : '#E0E0E0',
            fontSize: { xs: '1rem', md: '1.1rem' }, // Increased font size
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

      {/* Add pulse animation for next lesson */}
      <style jsx>{`
        @keyframes pulse {
          0% { box-shadow: 0 4px 12px rgba(255, 107, 53, 0.4); }
          50% { box-shadow: 0 6px 20px rgba(255, 107, 53, 0.8); }
          100% { box-shadow: 0 4px 12px rgba(255, 107, 53, 0.4); }
        }
      `}</style>
    </>
  );
}