'use client';

import { useState, useEffect, useRef, useMemo } from 'react';
import { Box } from '@mui/material';
import { type LessonWithProgress } from '@/lib/pathwayGeneration';
import { PATHWAY_CONFIG, shouldUseVirtualization } from './pathwayConfig';
import { 
  calculatePathwayDimensions,
  getVisibleLessonIndices,
  getGraduationInfo,
  type PathwayDimensions 
} from './pathwayUtils';
import HighwayLessonNode from './HighwayLessonNode';
import StraightGraduationDivider from './StraightGraduationDivider';

interface PathwayVirtualScrollerProps {
  lessons: LessonWithProgress[];
  currentLessonId: string | null;
  dimensions: PathwayDimensions;
  onLessonClick: (lesson: LessonWithProgress) => void;
  getLessonState: (lesson: LessonWithProgress, index: number) => 'completed' | 'next' | 'available' | 'locked';
}

export default function PathwayVirtualScroller({
  lessons,
  currentLessonId,
  dimensions,
  onLessonClick,
  getLessonState
}: PathwayVirtualScrollerProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [scrollTop, setScrollTop] = useState(0);
  const [viewportHeight, setViewportHeight] = useState(800);
  
  // Check if virtualization should be enabled
  const useVirtualization = shouldUseVirtualization(lessons.length);
  
  // Get graduation info
  const graduationInfo = useMemo(() => getGraduationInfo(lessons), [lessons]);
  
  // Calculate visible lesson indices for virtual scrolling
  const visibleIndices = useMemo(() => {
    if (!useVirtualization) {
      return { start: 0, end: lessons.length - 1 };
    }
    return getVisibleLessonIndices(lessons, scrollTop, viewportHeight, dimensions);
  }, [lessons, scrollTop, viewportHeight, dimensions, useVirtualization]);

  // Handle scroll events
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const handleScroll = () => {
      setScrollTop(container.scrollTop);
    };

    const handleResize = () => {
      setViewportHeight(container.clientHeight);
    };

    container.addEventListener('scroll', handleScroll);
    window.addEventListener('resize', handleResize);
    
    // Set initial viewport height
    setViewportHeight(container.clientHeight);

    return () => {
      container.removeEventListener('scroll', handleScroll);
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  // Render lesson nodes (virtual or all)
  const renderLessonNodes = () => {
    const nodesToRender = useVirtualization 
      ? lessons.slice(visibleIndices.start, visibleIndices.end + 1)
      : lessons;

    return nodesToRender.map((lesson, relativeIndex) => {
      const absoluteIndex = useVirtualization 
        ? visibleIndices.start + relativeIndex 
        : relativeIndex;
      
      const isCurrentLesson = lesson.lesson_id === currentLessonId;
      const lessonState = getLessonState(lesson, absoluteIndex);

      return (
        <Box
          key={lesson.lesson_id}
          sx={{ position: 'relative' }}
        >
          <HighwayLessonNode
            lesson={lesson}
            state={lessonState}
            onClick={() => onLessonClick(lesson)}
            lessonIndex={absoluteIndex}
            dimensions={dimensions}
          />
        </Box>
      );
    });
  };

  // Render graduation dividers (virtual or all)
  const renderGraduationDividers = () => {
    if (graduationInfo.count === 0) return null;

    const dividersToRender = useVirtualization
      ? graduationInfo.indices.filter((lessonIndex, graduationIndex) => {
          // Check if the graduation should be visible
          const graduationY = PATHWAY_CONFIG.spacing.start_offset + 
                              ((lessonIndex + 0.5) * dimensions.spacing);
          return graduationY >= scrollTop - 100 && 
                 graduationY <= scrollTop + viewportHeight + 100;
        })
      : graduationInfo.indices;

    return dividersToRender.map((lessonIndex, graduationIndex) => {
      const lesson = lessons[lessonIndex];
      const nextLesson = lessons[lessonIndex + 1];
      
      if (!nextLesson) return null;

      // Calculate graduation position
      const graduationY = PATHWAY_CONFIG.spacing.start_offset + 
                          ((lessonIndex + 0.5) * dimensions.spacing);

      return (
        <StraightGraduationDivider
          key={`graduation-${lessonIndex}`}
          x={dimensions.containerWidth / 2}
          y={graduationY}
          currentLevel={lesson.level}
          nextLevel={nextLesson.level}
          isCompleted={lesson.status === 'completed'}
        />
      );
    });
  };

  return (
    <Box
      ref={containerRef}
      sx={{
        height: '100%',
        overflowY: 'auto',
        overflowX: 'hidden',
        position: 'relative',
      }}
    >
      {/* Virtual scrolling container */}
      <Box
        sx={{
          height: `${dimensions.containerHeight}px`,
          position: 'relative',
        }}
      >
        {/* Render visible lesson nodes */}
        {renderLessonNodes()}
        
        {/* Render visible graduation dividers */}
        {renderGraduationDividers()}
        
        {/* Spacer for performance - only render if not using virtualization */}
        {!useVirtualization && (
          <Box sx={{ 
            position: 'absolute',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
            pointerEvents: 'none',
            // Pre-allocate space for better scrolling performance
            content: '""'
          }} />
        )}
      </Box>
    </Box>
  );
}