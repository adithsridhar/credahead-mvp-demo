'use client';

import { useState, useEffect, useRef } from 'react';
import { Box, Fab, Typography } from '@mui/material';
import { KeyboardArrowUp } from '@mui/icons-material';
import { type LessonWithProgress } from '@/lib/pathwayGeneration';
import { PATHWAY_CONFIG } from './pathwayConfig';
import { 
  calculatePathwayDimensions,
  calculateGraduationPosition,
  getGraduationInfo,
  calculateScrollPosition,
  type PathwayDimensions 
} from './pathwayUtils';
import CurvedPath from './HighwayPath';
import HighwayLessonNode from './HighwayLessonNode';
import StraightGraduationDivider from './StraightGraduationDivider';
import LevelUpPopup from './LevelUpPopup';
import LessonDetailPopup from './LessonDetailPopup';

interface PathwayContainerProps {
  lessons: LessonWithProgress[];
  currentLessonId: string | null;
  onLessonStart: (lessonId: string) => void;
}

export default function PathwayContainer({
  lessons,
  currentLessonId,
  onLessonStart
}: PathwayContainerProps) {
  const [selectedLesson, setSelectedLesson] = useState<LessonWithProgress | null>(null);
  const [showReturnButton, setShowReturnButton] = useState(false);
  const [showLevelUpPopup, setShowLevelUpPopup] = useState(false);
  const [levelUpData, setLevelUpData] = useState<{from: number, to: number} | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const currentLessonRef = useRef<HTMLDivElement>(null);

  // Determine lesson states
  const getLessonState = (lesson: LessonWithProgress, index: number): 'completed' | 'next' | 'available' | 'locked' => {
    if (lesson.status === 'completed') return 'completed';
    if (lesson.status === 'locked') return 'locked';
    if (lesson.lesson_id === currentLessonId) return 'next';
    return 'available';
  };

  // Calculate pathway dimensions using centralized utilities
  const dimensions = calculatePathwayDimensions(lessons);
  const graduationInfo = getGraduationInfo(lessons);
  const currentLessonIndex = lessons.findIndex(lesson => lesson.lesson_id === currentLessonId);

  // Group lessons by level and detect level completions
  const lessonsByLevel = lessons.reduce((acc, lesson) => {
    if (!acc[lesson.level]) acc[lesson.level] = [];
    acc[lesson.level].push(lesson);
    return acc;
  }, {} as Record<number, LessonWithProgress[]>);

  // Check for level completions and show popup
  useEffect(() => {
    const levels = Object.keys(lessonsByLevel).map(Number).sort((a, b) => a - b);
    
    for (const level of levels) {
      const levelLessons = lessonsByLevel[level];
      const allCompleted = levelLessons.every(lesson => lesson.status === 'completed');
      
      if (allCompleted && levelLessons.length > 0) {
        const nextLevel = levels.find(l => l > level);
        if (nextLevel) {
          // Check if we should show level up popup (only once per level completion)
          const lastCompletedLesson = levelLessons[levelLessons.length - 1];
          if (lastCompletedLesson.lesson_id === currentLessonId) {
            setLevelUpData({ from: level, to: nextLevel });
            setShowLevelUpPopup(true);
          }
        }
      }
    }
  }, [lessons, currentLessonId, lessonsByLevel]);

  // Enhanced auto-scroll using centralized utilities - only on lesson change
  useEffect(() => {
    if (currentLessonIndex !== -1 && containerRef.current && currentLessonId) {
      const container = containerRef.current;
      const containerHeight = container.clientHeight;
      const scrollTop = calculateScrollPosition(currentLessonIndex, containerHeight, dimensions);
      
      // Add delay for smooth rendering
      setTimeout(() => {
        container.scrollTo({
          top: scrollTop,
          behavior: 'smooth'
        });
      }, PATHWAY_CONFIG.viewport.auto_scroll_delay);
    }
  }, [currentLessonId]); // Only depend on currentLessonId, not dimensions

  // Handle scroll to show/hide return button
  useEffect(() => {
    const container = containerRef.current;
    if (!container || !currentLessonRef.current) return;

    const handleScroll = () => {
      const currentElement = currentLessonRef.current;
      if (!currentElement) return;

      const containerRect = container.getBoundingClientRect();
      const elementRect = currentElement.getBoundingClientRect();
      
      // Show return button if current lesson is not visible
      const isVisible = (
        elementRect.top >= containerRect.top &&
        elementRect.bottom <= containerRect.bottom
      );
      
      setShowReturnButton(!isVisible);
    };

    container.addEventListener('scroll', handleScroll);
    return () => container.removeEventListener('scroll', handleScroll);
  }, [currentLessonId]);

  const handleLessonClick = (lesson: LessonWithProgress) => {
    setSelectedLesson(lesson);
  };

  const handleClosePopup = () => {
    setSelectedLesson(null);
  };

  const scrollToCurrentLesson = () => {
    if (currentLessonIndex !== -1 && containerRef.current) {
      const container = containerRef.current;
      const containerHeight = container.clientHeight;
      const scrollTop = calculateScrollPosition(currentLessonIndex, containerHeight, dimensions);
      
      container.scrollTo({
        top: Math.max(0, scrollTop),
        behavior: 'smooth'
      });
    }
  };

  return (
    <>
      <Box
        ref={containerRef}
        sx={{
          height: '100vh',
          overflowY: 'auto',
          overflowX: 'hidden',
          position: 'relative',
          scrollBehavior: 'smooth',
          background: 'linear-gradient(180deg, #3b3b3b 0%, #2a2a2a 100%)',
          
          // Custom scrollbar
          '&::-webkit-scrollbar': {
            width: 8,
          },
          '&::-webkit-scrollbar-track': {
            backgroundColor: 'rgba(255, 255, 255, 0.1)',
          },
          '&::-webkit-scrollbar-thumb': {
            backgroundColor: 'rgba(255, 107, 53, 0.6)',
            borderRadius: 4,
          },
          '&::-webkit-scrollbar-thumb:hover': {
            backgroundColor: '#FF6B35',
          },
        }}
      >
        {/* Header */}
        <Box sx={{ 
          position: 'sticky', 
          top: 0, 
          zIndex: 10,
          backgroundColor: 'rgba(59, 59, 59, 0.95)',
          backdropFilter: 'blur(10px)',
          borderBottom: '2px solid rgba(255, 107, 53, 0.3)',
          py: 3,
          px: 2,
        }}>
          <Typography variant="h3" sx={{ 
            textAlign: 'center',
            color: '#FF6B35',
            fontWeight: 'bold',
            mb: 1
          }}>
            Learning Pathway
          </Typography>
          <Typography variant="h6" sx={{ 
            textAlign: 'center',
            color: '#E0E0E0',
            opacity: 0.8
          }}>
            {lessons.filter(l => l.status === 'completed').length}/{lessons.length} lessons completed
          </Typography>
        </Box>

        {/* Straight Pathway */}
        <Box sx={{ 
          maxWidth: PATHWAY_CONFIG.container.max_width,
          mx: 'auto',
          py: 4,
          px: 2,
          position: 'relative',
          minHeight: `${dimensions.containerHeight}px`,
        }}>
          {/* Straight Path Background */}
          <CurvedPath 
            dimensions={dimensions}
            graduationPositions={graduationInfo.positions}
          />
          
          {/* Lesson Nodes */}
          {lessons.map((lesson, index) => {
            const isCurrentLesson = lesson.lesson_id === currentLessonId;
            const lessonState = getLessonState(lesson, index);
            
            return (
              <Box
                key={lesson.lesson_id}
                ref={isCurrentLesson ? currentLessonRef : undefined}
                sx={{ position: 'relative' }}
              >
                <HighwayLessonNode
                  lesson={lesson}
                  state={lessonState}
                  onClick={() => handleLessonClick(lesson)}
                  lessonIndex={index}
                  dimensions={dimensions}
                />
              </Box>
            );
          })}
          
          {/* Graduation Dividers */}
          {graduationInfo.indices.map((lessonIndex, graduationIndex) => {
            const lesson = lessons[lessonIndex];
            const nextLesson = lessons[lessonIndex + 1];
            
            if (!nextLesson) return null;
            
            const graduationPosition = calculateGraduationPosition(graduationIndex, lessonIndex, dimensions);
            
            return (
              <StraightGraduationDivider
                key={`graduation-${lessonIndex}`}
                x={graduationPosition.x}
                y={graduationPosition.y}
                currentLevel={lesson.level}
                nextLevel={nextLesson.level}
                isCompleted={lesson.status === 'completed'}
              />
            );
          })}
        </Box>

        {/* Spacer for bottom padding */}
        <Box sx={{ height: `${PATHWAY_CONFIG.spacing.end_padding}px` }} />
      </Box>

      {/* Semi-transparent Return to Current Lesson Button */}
      {showReturnButton && currentLessonId && (
        <Fab
          onClick={scrollToCurrentLesson}
          sx={{
            position: 'fixed',
            bottom: 24,
            right: 24,
            backgroundColor: 'rgba(255, 107, 53, 0.4)', // More transparent base
            backdropFilter: 'blur(10px)', // Glass effect
            color: 'rgba(255, 255, 255, 0.9)',
            border: '1px solid rgba(255, 107, 53, 0.3)',
            transition: 'all 0.3s ease',
            '&:hover': {
              backgroundColor: 'rgba(255, 107, 53, 0.7)', // Less transparent on hover
              backdropFilter: 'blur(15px)',
              transform: 'scale(1.05)',
              boxShadow: '0 8px 20px rgba(255, 107, 53, 0.3)',
            },
            zIndex: 1000,
          }}
        >
          <KeyboardArrowUp />
        </Fab>
      )}

      {/* Level Up Popup */}
      {levelUpData && (
        <LevelUpPopup
          open={showLevelUpPopup}
          fromLevel={levelUpData.from}
          toLevel={levelUpData.to}
          onClose={() => {
            setShowLevelUpPopup(false);
            setLevelUpData(null);
          }}
        />
      )}

      {/* Lesson Detail Popup */}
      <LessonDetailPopup
        lesson={selectedLesson}
        open={!!selectedLesson}
        onClose={handleClosePopup}
        onStart={onLessonStart}
      />
    </>
  );
}