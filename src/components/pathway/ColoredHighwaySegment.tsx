'use client';

import { Box } from '@mui/material';

interface ColoredHighwaySegmentProps {
  startY: number;
  endY: number;
  width: number;
  height: number;
  state: 'completed' | 'next' | 'available' | 'locked';
  pathData: string;
  index: number;
}

export default function ColoredHighwaySegment({
  startY,
  endY,
  width,
  height,
  state,
  pathData,
  index
}: ColoredHighwaySegmentProps) {
  const getSegmentColor = () => {
    // White for all unlocked lessons, grey for locked
    if (state === 'locked') {
      return '#6B7280'; // Grey for locked
    }
    return '#ffffff'; // White for all unlocked (completed, next, available)
  };

  const clipId = `segment-clip-${index}`;

  return (
    <Box
      sx={{
        position: 'absolute',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        pointerEvents: 'none',
        zIndex: 2,
      }}
    >
      <svg
        width={width}
        height={height}
        style={{ position: 'absolute', top: 0, left: 0 }}
      >
        <defs>
          <clipPath id={clipId}>
            <rect x="0" y={startY} width={width} height={endY - startY} />
          </clipPath>
        </defs>

        {/* Colored segment of the center line - thick dashed */}
        <path
          d={pathData}
          stroke={getSegmentColor()}
          fill="none"
          strokeWidth="8"
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeDasharray="25,15"
          clipPath={`url(#${clipId})`}
        />
      </svg>
    </Box>
  );
}