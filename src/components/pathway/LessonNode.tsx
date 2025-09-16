'use client';

import { Box, Typography } from '@mui/material';
import { CheckCircle, Lock } from '@mui/icons-material';
import { type LessonWithProgress } from '@/lib/pathwayGeneration';

interface LessonNodeProps {
  lesson: LessonWithProgress;
  position: 'left' | 'right';
  state: 'completed' | 'next' | 'available' | 'locked';
  onClick: () => void;
  size?: 'small' | 'large';
}

export default function LessonNode({ 
  lesson, 
  position, 
  state, 
  onClick, 
  size = 'large' 
}: LessonNodeProps) {
  const getNodeSize = () => {
    if (size === 'small') {
      return { width: 60, height: 60, fontSize: '1rem' };
    }
    return { 
      width: { xs: 80, md: 100 }, 
      height: { xs: 80, md: 100 }, 
      fontSize: { xs: '1.2rem', md: '1.5rem' }
    };
  };

  const getNodeStyles = () => {
    const baseStyles = {
      ...getNodeSize(),
      borderRadius: '50%',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      cursor: state === 'locked' ? 'not-allowed' : 'pointer',
      transition: 'all 0.3s ease',
      border: '3px solid',
      fontWeight: 'bold',
      position: 'relative' as const,
      zIndex: 2,
      '&:hover': state !== 'locked' ? {
        transform: 'scale(1.05)',
        boxShadow: '0 8px 20px rgba(0,0,0,0.3)',
      } : {},
    };

    switch (state) {
      case 'completed':
        return {
          ...baseStyles,
          backgroundColor: '#10B981',
          borderColor: '#059669',
          color: 'white',
        };
      case 'next':
        return {
          ...baseStyles,
          backgroundColor: '#FF6B35',
          borderColor: '#E55A2B',
          color: 'white',
        };
      case 'available':
        return {
          ...baseStyles,
          backgroundColor: '#2B5CE6',
          borderColor: '#1E40AF',
          color: 'white',
        };
      case 'locked':
        return {
          ...baseStyles,
          backgroundColor: '#6B7280',
          borderColor: '#4B5563',
          color: '#9CA3AF',
          opacity: 0.7,
        };
      default:
        return baseStyles;
    }
  };

  const getLabelStyles = () => {
    const baseStyles = {
      position: 'absolute' as const,
      top: '50%',
      transform: 'translateY(-50%)',
      whiteSpace: 'nowrap' as const,
      maxWidth: { xs: '120px', md: '180px' },
      overflow: 'hidden',
      textOverflow: 'ellipsis',
    };

    if (position === 'left') {
      return {
        ...baseStyles,
        right: { xs: '90px', md: '120px' },
        textAlign: 'right' as const,
      };
    } else {
      return {
        ...baseStyles,
        left: { xs: '90px', md: '120px' },
        textAlign: 'left' as const,
      };
    }
  };

  const renderNodeContent = () => {
    if (state === 'completed') {
      return <CheckCircle sx={{ fontSize: { xs: '2rem', md: '2.5rem' } }} />;
    }
    if (state === 'locked') {
      return <Lock sx={{ fontSize: { xs: '1.5rem', md: '2rem' } }} />;
    }
    return (
      <Typography 
        variant="h6" 
        sx={{ 
          fontSize: getNodeSize().fontSize,
          fontWeight: 'bold' 
        }}
      >
        {lesson.level}
      </Typography>
    );
  };

  return (
    <Box
      sx={{
        position: 'relative',
        display: 'flex',
        alignItems: 'center',
        justifyContent: position === 'left' ? 'flex-end' : 'flex-start',
        width: '100%',
        my: { xs: 6, md: 5 }, // Spacing for 2-3 mobile, 4-5 desktop visibility
      }}
    >
      {/* Lesson Node */}
      <Box
        onClick={onClick}
        sx={getNodeStyles()}
      >
        {renderNodeContent()}
      </Box>

      {/* Lesson Label */}
      <Box sx={getLabelStyles()}>
        <Typography
          variant="h6"
          sx={{
            color: state === 'locked' ? '#6B7280' : '#E0E0E0',
            fontSize: { xs: '0.9rem', md: '1.1rem' },
            fontWeight: 'bold',
            mb: 0.5,
            opacity: state === 'locked' ? 0.7 : 1,
          }}
        >
          {lesson.title}
        </Typography>
        <Typography
          variant="caption"
          sx={{
            color: state === 'locked' ? '#6B7280' : '#B0B0B0',
            fontSize: { xs: '0.75rem', md: '0.8rem' },
            opacity: state === 'locked' ? 0.7 : 0.8,
          }}
        >
          (Level {lesson.level})
        </Typography>
      </Box>
    </Box>
  );
}