'use client';

import { Box, Typography } from '@mui/material';
import { getPathCoordinates } from './HighwayPath';

interface LevelGraduationDividerProps {
  currentLevel: number;
  nextLevel: number;
  yPosition: number;
  isCompleted: boolean;
  containerWidth?: number;
  containerHeight?: number;
}

export default function LevelGraduationDivider({
  currentLevel,
  nextLevel,
  yPosition,
  isCompleted,
  containerWidth = 600,
  containerHeight = 2000
}: LevelGraduationDividerProps) {
  // Calculate exact position on curved path
  const pathCoords = getPathCoordinates(yPosition, containerWidth, containerHeight);
  return (
    <Box
      sx={{
        position: 'absolute',
        top: yPosition,
        left: `${pathCoords.x}px`,
        transform: 'translate(-50%, -50%)',
        zIndex: 8,
        textAlign: 'center',
      }}
    >
      <Typography
        sx={{
          color: isCompleted ? '#10B981' : '#6B7280',
          fontSize: '1.1rem',
          fontStyle: 'italic',
          fontFamily: 'serif',
          textShadow: '0 2px 4px rgba(0,0,0,0.7)',
          opacity: isCompleted ? 1 : 0.7,
          whiteSpace: 'nowrap',
          fontWeight: 300,
          letterSpacing: '1px',
        }}
      >
        {isCompleted 
          ? '------✗----Literacy Score Increased----✗------'
          : '------✗----Level Graduation----✗------'
        }
      </Typography>
      <Typography
        sx={{
          color: isCompleted ? 'rgba(255, 255, 255, 0.9)' : 'rgba(255, 255, 255, 0.6)',
          fontSize: '0.7rem',
          fontStyle: 'italic',
          fontFamily: 'serif',
          textShadow: '0 1px 2px rgba(0,0,0,0.7)',
          opacity: 0.8,
          mt: 0.5,
          letterSpacing: '0.5px',
        }}
      >
        Level {currentLevel} → Level {nextLevel}
      </Typography>
    </Box>
  );
}