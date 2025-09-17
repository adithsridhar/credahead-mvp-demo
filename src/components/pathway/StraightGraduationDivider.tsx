'use client';

import { Box, Typography } from '@mui/material';

interface StraightGraduationDividerProps {
  x: number;
  y: number;
  currentLevel: number;
  nextLevel: number;
  isCompleted: boolean;
}

export default function StraightGraduationDivider({
  x,
  y,
  currentLevel,
  nextLevel,
  isCompleted
}: StraightGraduationDividerProps) {
  return (
    <Box
      sx={{
        position: 'absolute',
        left: `${x}px`,
        top: `${y}px`,
        transform: 'translate(-50%, -50%)',
        zIndex: 8,
        textAlign: 'center',
        width: '400px', // Increased width for better spacing
        py: 2, // Added vertical padding for buffer
      }}
    >
      {/* Decorative line above */}
      <Box
        sx={{
          width: '100%',
          height: '2px',
          backgroundColor: isCompleted ? '#10B981' : '#6B7280',
          mb: 2,
          position: 'relative',
          '&::before': {
            content: '"✗"',
            position: 'absolute',
            left: '20%',
            top: '-8px',
            color: isCompleted ? '#10B981' : '#6B7280',
            fontSize: '1rem',
          },
          '&::after': {
            content: '"✗"',
            position: 'absolute',
            right: '20%',
            top: '-8px',
            color: isCompleted ? '#10B981' : '#6B7280',
            fontSize: '1rem',
          }
        }}
      />
      
      {/* Graduation Text */}
      <Typography
        sx={{
          color: isCompleted ? '#10B981' : '#6B7280',
          fontSize: '1.1rem',
          fontStyle: 'italic',
          fontFamily: 'serif',
          textShadow: '0 2px 4px rgba(0,0,0,0.7)',
          opacity: isCompleted ? 1 : 0.7,
          fontWeight: 600,
          mb: 1,
        }}
      >
        Literacy Score Increased!
      </Typography>
      
      {/* Level transition */}
      <Typography
        sx={{
          color: isCompleted ? 'rgba(255, 255, 255, 0.9)' : 'rgba(255, 255, 255, 0.6)',
          fontSize: '0.8rem',
          fontStyle: 'italic',
          fontFamily: 'serif',
          textShadow: '0 1px 2px rgba(0,0,0,0.7)',
          opacity: 0.8,
        }}
      >
        Level {currentLevel} → Level {nextLevel}
      </Typography>
      
      {/* Decorative line below */}
      <Box
        sx={{
          width: '100%',
          height: '2px',
          backgroundColor: isCompleted ? '#10B981' : '#6B7280',
          mt: 2,
          position: 'relative',
          '&::before': {
            content: '"✗"',
            position: 'absolute',
            left: '20%',
            top: '-8px',
            color: isCompleted ? '#10B981' : '#6B7280',
            fontSize: '1rem',
          },
          '&::after': {
            content: '"✗"',
            position: 'absolute',
            right: '20%',
            top: '-8px',
            color: isCompleted ? '#10B981' : '#6B7280',
            fontSize: '1rem',
          }
        }}
      />
    </Box>
  );
}