'use client';

import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Typography,
  Box,
  Chip,
  IconButton,
} from '@mui/material';
import { Close, Lock, PlayArrow, CheckCircle } from '@mui/icons-material';
import { type LessonWithProgress } from '@/lib/pathwayGeneration';

interface LessonDetailPopupProps {
  lesson: LessonWithProgress | null;
  open: boolean;
  onClose: () => void;
  onStart: (lessonId: string) => void;
}

export default function LessonDetailPopup({
  lesson,
  open,
  onClose,
  onStart
}: LessonDetailPopupProps) {
  if (!lesson) return null;

  const getStatusIcon = () => {
    switch (lesson.status) {
      case 'completed':
        return <CheckCircle sx={{ color: '#10B981', mr: 1 }} />;
      case 'available':
        return <PlayArrow sx={{ color: '#2B5CE6', mr: 1 }} />;
      case 'locked':
        return <Lock sx={{ color: '#6B7280', mr: 1 }} />;
      default:
        return <PlayArrow sx={{ color: '#FF6B35', mr: 1 }} />;
    }
  };

  const getStatusText = () => {
    switch (lesson.status) {
      case 'completed':
        return 'Completed';
      case 'available':
        return 'Available';
      case 'locked':
        return 'Locked';
      default:
        return 'Available';
    }
  };

  const getStatusColor = () => {
    switch (lesson.status) {
      case 'completed':
        return '#10B981';
      case 'available':
        return '#2B5CE6';
      case 'locked':
        return '#6B7280';
      default:
        return '#FF6B35';
    }
  };

  const handleStartLesson = () => {
    if (lesson.status !== 'locked') {
      onStart(lesson.lesson_id);
    }
    onClose();
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="sm"
      fullWidth
      PaperProps={{
        sx: {
          backgroundColor: '#4a4a4a',
          borderRadius: 2,
          border: `2px solid ${getStatusColor()}`,
        }
      }}
    >
      <DialogTitle sx={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center',
        pb: 1
      }}>
        <Box sx={{ display: 'flex', alignItems: 'center' }}>
          {getStatusIcon()}
          <Typography variant="h5" sx={{ 
            color: '#FF6B35', 
            fontWeight: 'bold' 
          }}>
            {lesson.title}
          </Typography>
        </Box>
        <IconButton 
          onClick={onClose}
          sx={{ color: '#E0E0E0' }}
        >
          <Close />
        </IconButton>
      </DialogTitle>

      <DialogContent sx={{ pt: 2 }}>
        {/* Status and Level Chips */}
        <Box sx={{ display: 'flex', gap: 1, mb: 3 }}>
          <Chip
            label={getStatusText()}
            sx={{
              backgroundColor: getStatusColor(),
              color: 'white',
              fontWeight: 'bold',
            }}
          />
          <Chip
            label={`Level ${lesson.level}`}
            variant="outlined"
            sx={{
              borderColor: '#FF6B35',
              color: '#FF6B35',
            }}
          />
          {lesson.estimated_duration && (
            <Chip
              label={`${lesson.estimated_duration} min`}
              variant="outlined"
              sx={{
                borderColor: '#E0E0E0',
                color: '#E0E0E0',
              }}
            />
          )}
        </Box>

        {/* Description */}
        {lesson.description && (
          <Typography 
            variant="body1" 
            sx={{ 
              color: '#E0E0E0', 
              lineHeight: 1.6,
              mb: 3
            }}
          >
            {lesson.description}
          </Typography>
        )}

        {/* Learning Outcomes */}
        {lesson.learning_outcomes && (
          <Box sx={{ mb: 3 }}>
            <Typography 
              variant="h6" 
              sx={{ color: '#FF6B35', mb: 1 }}
            >
              What you'll learn:
            </Typography>
            <Typography 
              variant="body2" 
              sx={{ color: '#B0B0B0' }}
            >
              {typeof lesson.learning_outcomes === 'string' 
                ? lesson.learning_outcomes 
                : JSON.stringify(lesson.learning_outcomes)}
            </Typography>
          </Box>
        )}

        {/* Prerequisites */}
        {lesson.prerequisites && lesson.prerequisites.length > 0 && (
          <Box sx={{ mb: 3 }}>
            <Typography 
              variant="h6" 
              sx={{ color: '#FF6B35', mb: 1 }}
            >
              Prerequisites:
            </Typography>
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
              {lesson.prerequisites.map((prereq) => (
                <Chip
                  key={prereq}
                  label={prereq}
                  size="small"
                  variant="outlined"
                  sx={{
                    borderColor: '#6B7280',
                    color: '#B0B0B0',
                  }}
                />
              ))}
            </Box>
          </Box>
        )}

        {/* Lock Reason */}
        {lesson.isLocked && lesson.lockReason && (
          <Box sx={{ 
            p: 2, 
            backgroundColor: 'rgba(107, 114, 128, 0.2)', 
            borderRadius: 1,
            border: '1px solid #6B7280',
            mb: 2
          }}>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
              <Lock sx={{ color: '#6B7280', mr: 1, fontSize: '1.2rem' }} />
              <Typography variant="subtitle2" sx={{ color: '#6B7280' }}>
                Lesson Locked
              </Typography>
            </Box>
            <Typography variant="body2" sx={{ color: '#9CA3AF' }}>
              {lesson.lockReason}
            </Typography>
          </Box>
        )}
      </DialogContent>

      <DialogActions sx={{ p: 3, pt: 1 }}>
        <Button 
          onClick={onClose}
          sx={{ 
            color: '#E0E0E0',
            '&:hover': { backgroundColor: 'rgba(224, 224, 224, 0.1)' }
          }}
        >
          Close
        </Button>
        <Button
          variant="contained"
          onClick={handleStartLesson}
          disabled={lesson.status === 'locked'}
          sx={{
            backgroundColor: getStatusColor(),
            '&:hover': {
              backgroundColor: getStatusColor(),
              opacity: 0.8,
            },
            '&:disabled': {
              backgroundColor: '#6B7280',
              color: '#9CA3AF',
            },
            px: 4,
          }}
        >
          {lesson.status === 'completed' ? 'Review Lesson' : 'Start Lesson'}
        </Button>
      </DialogActions>
    </Dialog>
  );
}