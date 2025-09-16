'use client';

import { Box } from '@mui/material';

interface PathConnectorProps {
  fromPosition: 'left' | 'right';
  toPosition: 'left' | 'right';
  state: 'completed' | 'upcoming';
}

export default function PathConnector({ 
  fromPosition, 
  toPosition, 
  state 
}: PathConnectorProps) {
  const getStrokeColor = () => {
    return state === 'completed' ? '#2B5CE6' : '#6B7280';
  };

  const getPath = () => {
    const height = 120; // Height between nodes (mobile: 6 * 20, desktop: 5 * 24)
    const width = 200; // Total width for curves
    const centerX = width / 2;
    
    // Determine start and end points based on positions
    const startX = fromPosition === 'left' ? width * 0.25 : width * 0.75;
    const endX = toPosition === 'left' ? width * 0.25 : width * 0.75;
    
    // Create gentle S-curve
    const controlPoint1X = startX;
    const controlPoint1Y = height * 0.3;
    const controlPoint2X = endX;
    const controlPoint2Y = height * 0.7;
    
    return `M ${startX} 0 
            C ${controlPoint1X} ${controlPoint1Y}, 
              ${controlPoint2X} ${controlPoint2Y}, 
              ${endX} ${height}`;
  };

  return (
    <Box
      sx={{
        position: 'relative',
        width: '100%',
        height: 0,
        display: 'flex',
        justifyContent: 'center',
        zIndex: 1,
      }}
    >
      <svg
        width="200"
        height="120"
        style={{
          position: 'absolute',
          top: '-60px', // Center the curve between nodes
          left: '50%',
          transform: 'translateX(-50%)',
          overflow: 'visible',
        }}
      >
        <path
          d={getPath()}
          stroke={getStrokeColor()}
          strokeWidth="4"
          fill="none"
          strokeLinecap="round"
          style={{
            transition: 'stroke 0.3s ease',
          }}
        />
      </svg>
    </Box>
  );
}