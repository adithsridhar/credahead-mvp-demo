'use client';

import { useState, useEffect, useMemo } from 'react';
import { Box, Alert, Collapse, IconButton } from '@mui/material';
import { ExpandLess, ExpandMore, Info } from '@mui/icons-material';
import { type LessonWithProgress } from '@/lib/pathwayGeneration';
import { 
  PATHWAY_CONFIG, 
  getAdaptiveSpacing, 
  getViewportConfig,
  shouldUseVirtualization 
} from './pathwayConfig';
import { calculatePathwayDimensions } from './pathwayUtils';

interface PathwayAdaptiveManagerProps {
  lessons: LessonWithProgress[];
  children: (adaptiveProps: {
    dimensions: ReturnType<typeof calculatePathwayDimensions>;
    useVirtualization: boolean;
    showPerformanceWarning: boolean;
    adaptiveSpacing: number;
  }) => React.ReactNode;
}

interface LevelSummary {
  level: number;
  totalLessons: number;
  completedLessons: number;
  isCompleted: boolean;
  lessons: LessonWithProgress[];
}

export default function PathwayAdaptiveManager({ 
  lessons, 
  children 
}: PathwayAdaptiveManagerProps) {
  const [screenSize, setScreenSize] = useState({ width: 1024, height: 768 });
  const [showLevelSummaries, setShowLevelSummaries] = useState(false);
  const [collapsedLevels, setCollapsedLevels] = useState<Set<number>>(new Set());

  // Monitor screen size changes
  useEffect(() => {
    const updateScreenSize = () => {
      setScreenSize({
        width: window.innerWidth,
        height: window.innerHeight,
      });
    };

    updateScreenSize();
    window.addEventListener('resize', updateScreenSize);
    return () => window.removeEventListener('resize', updateScreenSize);
  }, []);

  // Calculate adaptive properties
  const adaptiveProps = useMemo(() => {
    const adaptiveSpacing = getAdaptiveSpacing(lessons.length);
    const useVirtualization = shouldUseVirtualization(lessons.length);
    const viewportConfig = getViewportConfig(screenSize.height);
    
    // Recalculate dimensions with adaptive spacing
    const dimensions = calculatePathwayDimensions(lessons);
    
    // Update dimensions with adaptive spacing
    const adaptedDimensions = {
      ...dimensions,
      spacing: adaptiveSpacing,
      containerHeight: Math.min(
        PATHWAY_CONFIG.container.min_height_padding + (dimensions.totalElements * adaptiveSpacing),
        PATHWAY_CONFIG.scalability.max_container_height
      ),
    };

    const showPerformanceWarning = lessons.length > PATHWAY_CONFIG.scalability.adaptive_spacing_threshold;

    return {
      dimensions: adaptedDimensions,
      useVirtualization,
      showPerformanceWarning,
      adaptiveSpacing,
      viewportConfig,
    };
  }, [lessons, screenSize]);

  // Group lessons by level for potential collapse functionality
  const levelSummaries = useMemo((): LevelSummary[] => {
    const grouped = lessons.reduce((acc, lesson) => {
      if (!acc[lesson.level]) {
        acc[lesson.level] = [];
      }
      acc[lesson.level].push(lesson);
      return acc;
    }, {} as Record<number, LessonWithProgress[]>);

    return Object.entries(grouped).map(([level, levelLessons]) => ({
      level: parseInt(level),
      totalLessons: levelLessons.length,
      completedLessons: levelLessons.filter(l => l.status === 'completed').length,
      isCompleted: levelLessons.every(l => l.status === 'completed'),
      lessons: levelLessons,
    }));
  }, [lessons]);

  // Auto-collapse completed levels if there are too many lessons
  useEffect(() => {
    if (lessons.length > PATHWAY_CONFIG.scalability.adaptive_spacing_threshold) {
      const completedLevels = levelSummaries
        .filter(summary => summary.isCompleted)
        .map(summary => summary.level);
      
      setCollapsedLevels(new Set(completedLevels));
      setShowLevelSummaries(true);
    }
  }, [lessons.length, levelSummaries]);

  const toggleLevelCollapse = (level: number) => {
    const newCollapsed = new Set(collapsedLevels);
    if (newCollapsed.has(level)) {
      newCollapsed.delete(level);
    } else {
      newCollapsed.add(level);
    }
    setCollapsedLevels(newCollapsed);
  };

  return (
    <Box>
      {/* Performance and Adaptation Warnings */}
      {adaptiveProps.showPerformanceWarning && (
        <Box sx={{ mb: 2 }}>
          <Alert 
            severity="info" 
            icon={<Info />}
            sx={{ backgroundColor: 'rgba(45, 85, 125, 0.1)' }}
          >
            <Box>
              <strong>Adaptive Mode Active:</strong> With {lessons.length} lessons, spacing has been 
              reduced to {adaptiveProps.adaptiveSpacing}px for optimal performance.
              {adaptiveProps.useVirtualization && (
                <span> Virtual scrolling is enabled to maintain smooth performance.</span>
              )}
            </Box>
          </Alert>
        </Box>
      )}

      {/* Level Summary Toggle (for large lesson sets) */}
      {showLevelSummaries && (
        <Box sx={{ mb: 2 }}>
          <Alert 
            severity="success"
            action={
              <IconButton
                size="small"
                onClick={() => {
                  // Toggle all completed levels
                  const completedLevels = levelSummaries
                    .filter(s => s.isCompleted)
                    .map(s => s.level);
                  
                  const allCollapsed = completedLevels.every(level => 
                    collapsedLevels.has(level)
                  );
                  
                  if (allCollapsed) {
                    // Expand all
                    setCollapsedLevels(new Set());
                  } else {
                    // Collapse all completed
                    setCollapsedLevels(new Set(completedLevels));
                  }
                }}
              >
                {levelSummaries.filter(s => s.isCompleted).every(s => 
                  collapsedLevels.has(s.level)
                ) ? <ExpandMore /> : <ExpandLess />}
              </IconButton>
            }
          >
            <Box>
              <strong>Level Management:</strong> {levelSummaries.filter(s => s.isCompleted).length} completed 
              levels can be collapsed for better overview.
            </Box>
          </Alert>
        </Box>
      )}

      {/* Level Summaries */}
      {showLevelSummaries && (
        <Box sx={{ mb: 3 }}>
          {levelSummaries.map(summary => (
            <Box key={summary.level} sx={{ mb: 1 }}>
              <Box 
                onClick={() => toggleLevelCollapse(summary.level)}
                sx={{ 
                  display: 'flex', 
                  alignItems: 'center', 
                  cursor: 'pointer',
                  p: 1,
                  backgroundColor: summary.isCompleted 
                    ? 'rgba(16, 185, 129, 0.1)' 
                    : 'rgba(59, 130, 246, 0.1)',
                  borderRadius: 1,
                  '&:hover': {
                    backgroundColor: summary.isCompleted 
                      ? 'rgba(16, 185, 129, 0.2)' 
                      : 'rgba(59, 130, 246, 0.2)',
                  }
                }}
              >
                <IconButton size="small">
                  {collapsedLevels.has(summary.level) ? <ExpandMore /> : <ExpandLess />}
                </IconButton>
                <Box sx={{ flexGrow: 1 }}>
                  <strong>Level {summary.level}</strong>: {summary.completedLessons}/{summary.totalLessons} completed
                  {summary.isCompleted && <span> ✓</span>}
                </Box>
              </Box>
            </Box>
          ))}
        </Box>
      )}

      {/* Main Content with Adaptive Properties */}
      {children(adaptiveProps)}
    </Box>
  );
}