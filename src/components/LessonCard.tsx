'use client';

import { Card, CardContent, Typography, Button, Box, Chip } from '@mui/material';
import { Lock, CheckCircle, PlayArrow } from '@mui/icons-material';
import type { Lesson } from '@/lib/supabase';

interface LessonCardProps {
  lesson: Lesson & {
    status: 'completed' | 'available' | 'locked';
    isLocked: boolean;
    lockReason?: string | null;
  };
  onStart: () => void;
}

export default function LessonCard({ lesson, onStart }: LessonCardProps) {
  const getStatusIcon = () => {
    switch (lesson.status) {
      case 'completed':
        return <CheckCircle sx={{ color: '#4CAF50' }} />;
      case 'locked':
        return <Lock sx={{ color: '#999' }} />;
      default:
        return <PlayArrow sx={{ color: '#FF6B35' }} />;
    }
  };

  const getStatusColor = () => {
    switch (lesson.status) {
      case 'completed':
        return '#4CAF50';
      case 'locked':
        return '#666';
      default:
        return '#FF6B35';
    }
  };

  return (
    <Card sx={{ 
      height: '100%', 
      display: 'flex', 
      flexDirection: 'column',
      opacity: lesson.isLocked ? 0.6 : 1,
      cursor: lesson.isLocked ? 'not-allowed' : 'pointer',
    }}>
      <CardContent sx={{ flexGrow: 1, p: 3 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
          <Chip 
            label={`Level ${lesson.level}`} 
            size="small" 
            sx={{ 
              backgroundColor: getStatusColor(),
              color: 'white',
              fontWeight: 'bold'
            }} 
          />
          {getStatusIcon()}
        </Box>

        <Typography variant="h6" component="h3" gutterBottom sx={{ fontWeight: 'bold' }}>
          {lesson.title}
        </Typography>

        {lesson.description && (
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2, lineHeight: 1.5 }}>
            {lesson.description}
          </Typography>
        )}

        {lesson.estimated_duration && (
          <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 2 }}>
            Estimated Duration: {lesson.estimated_duration} minutes
          </Typography>
        )}

        {lesson.lockReason && (
          <Typography variant="caption" color="error" sx={{ display: 'block', mb: 2 }}>
            {lesson.lockReason}
          </Typography>
        )}

        <Box sx={{ mt: 'auto' }}>
          <Button
            variant="contained"
            fullWidth
            onClick={onStart}
            disabled={lesson.isLocked}
            sx={{
              backgroundColor: lesson.isLocked ? '#666' : getStatusColor(),
              '&:hover': {
                backgroundColor: lesson.isLocked ? '#666' : '#e55a2b',
              },
              py: 1.5,
            }}
          >
            {lesson.status === 'completed' ? 'Review' : 
             lesson.status === 'locked' ? 'Locked' : 'Start Lesson'}
          </Button>
        </Box>
      </CardContent>
    </Card>
  );
}