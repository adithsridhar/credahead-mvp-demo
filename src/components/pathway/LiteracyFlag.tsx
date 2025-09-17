'use client';

import { Box, Typography } from '@mui/material';
import { Flag } from '@mui/icons-material';

interface LiteracyFlagProps {
  x: number;
  y: number;
  currentLevel: number;
  nextLevel: number;
  isCompleted: boolean;
}

export default function LiteracyFlag({
  x,
  y,
  currentLevel,
  nextLevel,
  isCompleted
}: LiteracyFlagProps) {
  return (
    <Box
      sx={{
        position: 'absolute',
        left: `${x}px`,
        top: `${y}px`,
        transform: 'translate(-50%, -50%)',
        zIndex: 8,
        textAlign: 'center',
      }}
    >
      {/* Flag Icon */}
      <Box sx={{ display: 'flex', justifyContent: 'center', mb: 1 }}>
        <Flag 
          sx={{ 
            fontSize: '2rem',
            color: isCompleted ? '#10B981' : '#6B7280',
            filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.7))',
          }} 
        />
      </Box>
      
      {/* Literacy Score Text */}
      <Typography
        sx={{
          color: isCompleted ? '#10B981' : '#6B7280',
          fontSize: '0.9rem',
          fontStyle: 'italic',
          fontFamily: 'serif',
          textShadow: '0 2px 4px rgba(0,0,0,0.7)',
          opacity: isCompleted ? 1 : 0.7,
          whiteSpace: 'nowrap',
          fontWeight: 600,
        }}
      >
        Literacy Score Increased!
      </Typography>
      
      {/* Level transition */}
      <Typography
        sx={{
          color: isCompleted ? 'rgba(255, 255, 255, 0.9)' : 'rgba(255, 255, 255, 0.6)',
          fontSize: '0.7rem',
          fontStyle: 'italic',
          fontFamily: 'serif',
          textShadow: '0 1px 2px rgba(0,0,0,0.7)',
          opacity: 0.8,
          mt: 0.5,
        }}
      >
        Level {currentLevel} → Level {nextLevel}
      </Typography>
    </Box>
  );
}