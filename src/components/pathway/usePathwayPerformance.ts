/**
 * Performance optimization hook for pathway components
 * Handles memoization, intersection observer, and smooth animations
 */

import { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import { type LessonWithProgress } from '@/lib/pathwayGeneration';
import { PATHWAY_CONFIG } from './pathwayConfig';
import { 
  calculatePathwayDimensions, 
  calculateScrollPosition,
  isElementInViewport,
  type PathwayDimensions 
} from './pathwayUtils';

interface UsePathwayPerformanceProps {
  lessons: LessonWithProgress[];
  currentLessonId: string | null;
}

interface PathwayPerformanceState {
  dimensions: PathwayDimensions;
  visibleLessons: Set<number>;
  isScrolling: boolean;
  lastScrollTime: number;
}

export function usePathwayPerformance({ 
  lessons, 
  currentLessonId 
}: UsePathwayPerformanceProps) {
  const [state, setState] = useState<PathwayPerformanceState>({
    dimensions: calculatePathwayDimensions(lessons),
    visibleLessons: new Set(),
    isScrolling: false,
    lastScrollTime: 0,
  });

  const observerRef = useRef<IntersectionObserver | null>(null);
  const scrollTimeoutRef = useRef<NodeJS.Timeout>();
  const lessonsCache = useRef<Map<string, LessonWithProgress>>(new Map());

  // Memoized calculations
  const memoizedDimensions = useMemo(() => {
    return calculatePathwayDimensions(lessons);
  }, [lessons]);

  const memoizedCurrentLessonIndex = useMemo(() => {
    return lessons.findIndex(lesson => lesson.lesson_id === currentLessonId);
  }, [lessons, currentLessonId]);

  // Cache lessons for quick lookup
  useEffect(() => {
    lessonsCache.current.clear();
    lessons.forEach(lesson => {
      lessonsCache.current.set(lesson.lesson_id, lesson);
    });
  }, [lessons]);

  // Optimized scroll position calculation
  const calculateOptimalScrollPosition = useCallback((
    lessonIndex: number,
    containerHeight: number
  ): number => {
    return calculateScrollPosition(lessonIndex, containerHeight, memoizedDimensions);
  }, [memoizedDimensions]);

  // Throttled scroll handler
  const handleScroll = useCallback((scrollTop: number, viewportHeight: number) => {
    const now = Date.now();
    
    // Throttle scroll updates for performance
    if (now - state.lastScrollTime < 16) { // ~60fps
      return;
    }

    setState(prev => ({
      ...prev,
      isScrolling: true,
      lastScrollTime: now,
    }));

    // Calculate visible lessons
    const visible = new Set<number>();
    const startY = PATHWAY_CONFIG.spacing.start_offset;
    const spacing = memoizedDimensions.spacing;
    
    const firstVisible = Math.max(0, 
      Math.floor((scrollTop - startY) / spacing) - 2
    );
    const lastVisible = Math.min(lessons.length - 1,
      Math.ceil((scrollTop + viewportHeight - startY) / spacing) + 2
    );

    for (let i = firstVisible; i <= lastVisible; i++) {
      visible.add(i);
    }

    setState(prev => ({
      ...prev,
      visibleLessons: visible,
    }));

    // Clear scrolling flag after delay
    if (scrollTimeoutRef.current) {
      clearTimeout(scrollTimeoutRef.current);
    }
    
    scrollTimeoutRef.current = setTimeout(() => {
      setState(prev => ({
        ...prev,
        isScrolling: false,
      }));
    }, 150);
  }, [lessons.length, memoizedDimensions.spacing, state.lastScrollTime]);

  // Intersection Observer for visibility tracking
  useEffect(() => {
    if (typeof window === 'undefined') return;

    observerRef.current = new IntersectionObserver(
      (entries) => {
        entries.forEach(entry => {
          const lessonIndex = parseInt(entry.target.getAttribute('data-lesson-index') || '0');
          
          setState(prev => {
            const newVisible = new Set(prev.visibleLessons);
            if (entry.isIntersecting) {
              newVisible.add(lessonIndex);
            } else {
              newVisible.delete(lessonIndex);
            }
            return {
              ...prev,
              visibleLessons: newVisible,
            };
          });
        });
      },
      {
        root: null,
        rootMargin: '100px',
        threshold: 0.1,
      }
    );

    return () => {
      if (observerRef.current) {
        observerRef.current.disconnect();
      }
    };
  }, []);

  // Optimized lesson state calculation
  const getLessonState = useCallback((
    lesson: LessonWithProgress, 
    index: number
  ): 'completed' | 'next' | 'available' | 'locked' => {
    if (lesson.status === 'completed') return 'completed';
    if (lesson.status === 'locked') return 'locked';
    if (lesson.lesson_id === currentLessonId) return 'next';
    return 'available';
  }, [currentLessonId]);

  // Optimized smooth scroll function
  const smoothScrollToLesson = useCallback((
    lessonIndex: number,
    container: HTMLElement
  ): Promise<void> => {
    return new Promise((resolve) => {
      const containerHeight = container.clientHeight;
      const targetScrollTop = calculateOptimalScrollPosition(lessonIndex, containerHeight);
      
      // Use CSS scroll-behavior for hardware acceleration when possible
      if ('scrollBehavior' in container.style) {
        container.scrollTo({
          top: targetScrollTop,
          behavior: 'smooth'
        });
        
        // Resolve after animation completes
        setTimeout(resolve, 500);
      } else {
        // Fallback to manual animation for older browsers
        const startScrollTop = container.scrollTop;
        const distance = targetScrollTop - startScrollTop;
        const duration = 500;
        const startTime = performance.now();

        const animateScroll = (currentTime: number) => {
          const elapsed = currentTime - startTime;
          const progress = Math.min(elapsed / duration, 1);
          
          // Easing function for smooth animation
          const easeInOutCubic = (t: number): number => 
            t < 0.5 ? 4 * t * t * t : (t - 1) * (2 * t - 2) * (2 * t - 2) + 1;
          
          const easedProgress = easeInOutCubic(progress);
          container.scrollTop = startScrollTop + (distance * easedProgress);

          if (progress < 1) {
            requestAnimationFrame(animateScroll);
          } else {
            resolve();
          }
        };

        requestAnimationFrame(animateScroll);
      }
    });
  }, [calculateOptimalScrollPosition]);

  // Cleanup
  useEffect(() => {
    return () => {
      if (scrollTimeoutRef.current) {
        clearTimeout(scrollTimeoutRef.current);
      }
    };
  }, []);

  return {
    dimensions: memoizedDimensions,
    currentLessonIndex: memoizedCurrentLessonIndex,
    visibleLessons: state.visibleLessons,
    isScrolling: state.isScrolling,
    handleScroll,
    getLessonState,
    smoothScrollToLesson,
    observeElement: (element: HTMLElement, lessonIndex: number) => {
      element.setAttribute('data-lesson-index', lessonIndex.toString());
      observerRef.current?.observe(element);
    },
    unobserveElement: (element: HTMLElement) => {
      observerRef.current?.unobserve(element);
    },
  };
}