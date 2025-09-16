'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import {
  Container,
  CircularProgress,
  Alert,
  Typography,
  Box,
} from '@mui/material';
import { useAuth } from '@/contexts/AuthContext';
import { generatePathway, type LessonWithProgress } from '@/lib/pathwayGeneration';
import PathwayContainer from '@/components/pathway/PathwayContainer';

export default function PathwayPage() {
  const router = useRouter();
  const { user, appUser } = useAuth();

  const { data: pathway = [], isLoading, error } = useQuery({
    queryKey: ['pathway', user?.id, appUser?.literacy_level],
    queryFn: async () => {
      if (!user?.id || !appUser?.literacy_level) return [];
      return generatePathway(user.id, appUser.literacy_level);
    },
    enabled: !!user?.id && !!appUser?.literacy_level,
    refetchOnWindowFocus: false,
  });

  // Find current lesson (first available lesson)
  const currentLessonId = pathway.find(lesson => 
    lesson.status === 'available' && !lesson.isLocked
  )?.lesson_id || null;

  const handleLessonStart = (lessonId: string) => {
    router.push(`/lesson/${lessonId}`);
  };

  if (!user || !appUser) {
    return (
      <Container maxWidth="sm" sx={{ textAlign: 'center', mt: 8 }}>
        <Typography variant="h5" gutterBottom>
          Please sign in to view your learning pathway
        </Typography>
      </Container>
    );
  }

  if (isLoading) {
    return (
      <Box sx={{ 
        display: 'flex', 
        flexDirection: 'column',
        alignItems: 'center', 
        justifyContent: 'center',
        minHeight: '100vh',
        backgroundColor: '#3b3b3b'
      }}>
        <CircularProgress size={60} sx={{ color: '#FF6B35', mb: 3 }} />
        <Typography variant="h6" sx={{ color: '#E0E0E0' }}>
          Loading your pathway...
        </Typography>
      </Box>
    );
  }

  if (error) {
    return (
      <Container maxWidth="md" sx={{ mt: 4 }}>
        <Alert severity="error">
          Failed to load your learning pathway. Please try again.
        </Alert>
      </Container>
    );
  }

  if (pathway.length === 0) {
    return (
      <Box sx={{ 
        display: 'flex', 
        flexDirection: 'column',
        alignItems: 'center', 
        justifyContent: 'center',
        minHeight: '100vh',
        backgroundColor: '#3b3b3b',
        px: 2
      }}>
        <Typography variant="h4" sx={{ 
          color: '#FF6B35', 
          mb: 2, 
          textAlign: 'center',
          fontWeight: 'bold'
        }}>
          No Lessons Available
        </Typography>
        <Typography variant="body1" sx={{ 
          color: '#E0E0E0', 
          textAlign: 'center',
          maxWidth: '500px'
        }}>
          No lessons are available for your current literacy level. 
          Take the initial assessment to get started on your learning journey!
        </Typography>
      </Box>
    );
  }

  return (
    <PathwayContainer
      lessons={pathway}
      currentLessonId={currentLessonId}
      onLessonStart={handleLessonStart}
    />
  );
}