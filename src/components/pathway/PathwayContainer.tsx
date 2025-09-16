'use client';

import { useState, useEffect, useRef } from 'react';
import { Box, Fab, Typography } from '@mui/material';
import { KeyboardArrowUp } from '@mui/icons-material';
import { type LessonWithProgress } from '@/lib/pathwayGeneration';
import LessonNode from './LessonNode';
import PathConnector from './PathConnector';
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
  const containerRef = useRef<HTMLDivElement>(null);
  const currentLessonRef = useRef<HTMLDivElement>(null);

  // Determine lesson states
  const getLessonState = (lesson: LessonWithProgress, index: number): 'completed' | 'next' | 'available' | 'locked' => {
    if (lesson.status === 'completed') return 'completed';
    if (lesson.status === 'locked') return 'locked';
    if (lesson.lesson_id === currentLessonId) return 'next';
    return 'available';
  };

  // Find current lesson index
  const currentLessonIndex = lessons.findIndex(lesson => lesson.lesson_id === currentLessonId);

  // Auto-scroll to current lesson on mount
  useEffect(() => {
    if (currentLessonRef.current && containerRef.current) {
      const container = containerRef.current;
      const currentElement = currentLessonRef.current;
      
      // Calculate scroll position to center the current lesson
      const containerHeight = container.clientHeight;
      const elementTop = currentElement.offsetTop;
      const elementHeight = currentElement.clientHeight;
      const scrollTop = elementTop - (containerHeight / 2) + (elementHeight / 2);
      
      container.scrollTo({
        top: Math.max(0, scrollTop),
        behavior: 'smooth'
      });
    }
  }, [currentLessonId]);

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
    if (currentLessonRef.current && containerRef.current) {
      const container = containerRef.current;
      const currentElement = currentLessonRef.current;
      
      const containerHeight = container.clientHeight;
      const elementTop = currentElement.offsetTop;
      const elementHeight = currentElement.clientHeight;
      const scrollTop = elementTop - (containerHeight / 2) + (elementHeight / 2);
      
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

        {/* Pathway */}
        <Box sx={{ 
          maxWidth: '600px',
          mx: 'auto',
          py: 4,
          px: 2,
          position: 'relative',
        }}>
          {lessons.map((lesson, index) => {
            const isCurrentLesson = lesson.lesson_id === currentLessonId;
            const lessonState = getLessonState(lesson, index);
            const position = index % 2 === 0 ? 'left' : 'right';
            const isLast = index === lessons.length - 1;
            
            // Determine connector state
            const connectorState = lesson.status === 'completed' ? 'completed' : 'upcoming';

            return (
              <Box 
                key={lesson.lesson_id}
                ref={isCurrentLesson ? currentLessonRef : undefined}
              >
                <LessonNode
                  lesson={lesson}
                  position={position}
                  state={lessonState}
                  onClick={() => handleLessonClick(lesson)}
                />
                
                {!isLast && (
                  <PathConnector
                    fromPosition={position}
                    toPosition={index % 2 === 0 ? 'right' : 'left'}
                    state={connectorState}
                  />
                )}
              </Box>
            );
          })}
        </Box>

        {/* Spacer for bottom padding */}
        <Box sx={{ height: '200px' }} />
      </Box>

      {/* Return to Current Lesson Button */}
      {showReturnButton && currentLessonId && (
        <Fab
          onClick={scrollToCurrentLesson}
          sx={{
            position: 'fixed',
            bottom: 24,
            right: 24,
            backgroundColor: 'rgba(255, 107, 53, 0.7)',
            color: 'white',
            '&:hover': {
              backgroundColor: '#FF6B35',
            },
            zIndex: 1000,
          }}
        >
          <KeyboardArrowUp />
        </Fab>
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