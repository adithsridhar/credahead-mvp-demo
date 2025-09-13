'use client';

import { useRouter } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import { Container, Typography, Grid, Box, Chip, CircularProgress, Button } from '@mui/material';
import { School, TrendingUp } from '@mui/icons-material';
import { useAuth } from '@/contexts/AuthContext';
import { generatePathway, type LessonWithProgress } from '@/lib/pathwayGeneration';
import LessonCard from '@/components/LessonCard';

export default function PathwayPage() {
  const router = useRouter();
  const { user, appUser } = useAuth();

  const { 
    data: pathway, 
    isLoading, 
    error,
    refetch 
  } = useQuery({
    queryKey: ['pathway', user?.id, appUser?.literacy_level],
    queryFn: () => {
      if (!user || !appUser) throw new Error('User not authenticated');
      return generatePathway(user.id, appUser.literacy_level);
    },
    enabled: !!user && !!appUser,
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
  });

  const handleLessonStart = (lesson: LessonWithProgress) => {
    if (lesson.isLocked) return;
    router.push(`/lesson/${lesson.lesson_id}`);
  };

  if (!user || !appUser) {
    return (
      <Container maxWidth="sm" sx={{ textAlign: 'center', mt: 8 }}>
        <Typography variant="h5" gutterBottom>
          Please sign in to view your learning pathway
        </Typography>
        <Button
          variant="contained"
          onClick={() => router.push('/auth/signin')}
          sx={{ mt: 2, backgroundColor: '#FF6B35' }}
        >
          Sign In
        </Button>
      </Container>
    );
  }

  if (!appUser.assessment_taken) {
    return (
      <Container maxWidth="md" sx={{ textAlign: 'center', mt: 8 }}>
        <School sx={{ fontSize: 80, color: '#FF6B35', mb: 2 }} />
        <Typography variant="h4" gutterBottom sx={{ color: '#FF6B35' }}>
          Take Your Assessment First
        </Typography>
        <Typography variant="h6" sx={{ mb: 4, color: '#E0E0E0' }}>
          Complete the initial assessment to unlock your personalized learning pathway.
        </Typography>
        <Button
          variant="contained"
          size="large"
          onClick={() => router.push('/assessment')}
          sx={{
            backgroundColor: '#FF6B35',
            '&:hover': { backgroundColor: '#e55a2b' },
            px: 4,
            py: 1.5,
          }}
        >
          Start Assessment
        </Button>
      </Container>
    );
  }

  if (isLoading) {
    return (
      <Container maxWidth="sm" sx={{ textAlign: 'center', mt: 8 }}>
        <CircularProgress size={60} sx={{ color: '#FF6B35', mb: 3 }} />
        <Typography variant="h6">Loading your learning pathway...</Typography>
      </Container>
    );
  }

  if (error) {
    return (
      <Container maxWidth="sm" sx={{ textAlign: 'center', mt: 8 }}>
        <Typography variant="h6" color="error" gutterBottom>
          Error loading pathway
        </Typography>
        <Button onClick={() => refetch()} variant="outlined">
          Try Again
        </Button>
      </Container>
    );
  }

  const completedLessons = pathway?.filter(l => l.status === 'completed').length || 0;
  const totalLessons = pathway?.length || 0;
  const progressPercentage = totalLessons > 0 ? (completedLessons / totalLessons) * 100 : 0;

  // Group lessons by level for better organization
  const lessonsByLevel = pathway?.reduce((acc, lesson) => {
    if (!acc[lesson.level]) {
      acc[lesson.level] = [];
    }
    acc[lesson.level].push(lesson);
    return acc;
  }, {} as Record<number, LessonWithProgress[]>) || {};

  const levels = Object.keys(lessonsByLevel).map(Number).sort((a, b) => a - b);

  return (
    <Container maxWidth="xl" sx={{ py: 4 }}>
      {/* Header Section */}
      <Box sx={{ mb: 4 }}>
        <Typography variant="h3" component="h1" gutterBottom sx={{ 
          color: '#FF6B35', 
          fontWeight: 'bold' 
        }}>
          Your Learning Pathway
        </Typography>
        
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 3 }}>
          <Chip 
            icon={<TrendingUp />}
            label={`Current Level: ${appUser.literacy_level}`} 
            sx={{ 
              backgroundColor: '#FF6B35',
              color: 'white',
              fontWeight: 'bold',
              fontSize: '1rem',
              height: 40,
            }} 
          />
          <Typography variant="h6" sx={{ color: '#E0E0E0' }}>
            {completedLessons} of {totalLessons} lessons completed ({Math.round(progressPercentage)}%)
          </Typography>
        </Box>

        <Box sx={{ mb: 2 }}>
          <Typography variant="body2" sx={{ color: '#B0B0B0', mb: 1 }}>
            Overall Progress
          </Typography>
          <Box sx={{ 
            width: '100%', 
            height: 8, 
            backgroundColor: 'rgba(255,255,255,0.2)', 
            borderRadius: 4,
            overflow: 'hidden'
          }}>
            <Box sx={{ 
              width: `${progressPercentage}%`, 
              height: '100%', 
              backgroundColor: '#FF6B35',
              transition: 'width 0.3s ease'
            }} />
          </Box>
        </Box>
      </Box>

      {/* Lessons by Level */}
      {levels.map(level => {
        const levelLessons = lessonsByLevel[level];
        const levelCompleted = levelLessons.filter(l => l.status === 'completed').length;
        const levelTotal = levelLessons.length;
        const levelProgress = levelTotal > 0 ? (levelCompleted / levelTotal) * 100 : 0;

        return (
          <Box key={level} sx={{ mb: 4 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
              <Typography variant="h5" sx={{ color: '#FF6B35', fontWeight: 'bold' }}>
                Level {level}
              </Typography>
              <Chip 
                label={`${levelCompleted}/${levelTotal} completed`}
                size="small"
                sx={{ 
                  backgroundColor: levelProgress === 100 ? '#4CAF50' : '#666',
                  color: 'white'
                }}
              />
            </Box>

            <Grid container spacing={3}>
              {levelLessons.map(lesson => (
                <Grid item xs={12} sm={6} md={4} lg={3} key={lesson.lesson_id}>
                  <LessonCard 
                    lesson={lesson}
                    onStart={() => handleLessonStart(lesson)}
                  />
                </Grid>
              ))}
            </Grid>
          </Box>
        );
      })}

      {pathway && pathway.length === 0 && (
        <Box sx={{ textAlign: 'center', py: 8 }}>
          <Typography variant="h6" sx={{ color: '#B0B0B0' }}>
            No lessons available. Please contact support.
          </Typography>
        </Box>
      )}
    </Container>
  );
}