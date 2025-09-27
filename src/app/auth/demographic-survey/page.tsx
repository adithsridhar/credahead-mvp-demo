'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { 
  Container, 
  Paper, 
  Typography, 
  Box, 
  FormControl, 
  InputLabel, 
  Select, 
  MenuItem, 
  TextField, 
  Button, 
  Alert,
  LinearProgress
} from '@mui/material';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/lib/supabase';

const AGE_RANGES = [
  '13-17',
  '18-21',
  '22-25',
  '26-30',
  '30-35',
  '35-39',
  '39-50',
  '50+'
];

const OCCUPATIONS = [
  'Student',
  'Salaried Employee',
  'Self Employed',
  'Other'
];

export default function DemographicSurveyPage() {
  const router = useRouter();
  const { user, appUser, refreshAppUser } = useAuth();
  const [ageRange, setAgeRange] = useState('');
  const [location, setLocation] = useState('');
  const [occupation, setOccupation] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Redirect if user is not authenticated
  useEffect(() => {
    if (!user) {
      router.push('/auth/signin');
      return;
    }

    // If user has already completed survey, redirect to assessment
    if (appUser?.survey_completed) {
      router.push('/assessment');
      return;
    }
  }, [user, appUser, router]);

  // Check if all fields are completed
  const isFormComplete = ageRange && location.trim() && occupation;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!isFormComplete || !user) {
      setError('Please complete all fields');
      return;
    }

    try {
      setLoading(true);
      setError('');

      // Update user record with demographic data
      const { error: updateError } = await supabase
        .from('users')
        .update({
          age_range: ageRange,
          location: location.trim(),
          occupation: occupation,
          survey_completed: true,
          updated_at: new Date().toISOString()
        })
        .eq('id', user.id);

      if (updateError) {
        throw updateError;
      }

      // Refresh user data
      await refreshAppUser();

      // Redirect to assessment
      router.push('/assessment');
    } catch (error: any) {
      console.error('Error saving demographic data:', error);
      setError(error.message || 'Failed to save survey data');
    } finally {
      setLoading(false);
    }
  };

  if (!user) {
    return (
      <Container maxWidth="sm" sx={{ textAlign: 'center', mt: 8 }}>
        <Typography variant="h6" color="text.secondary">
          Please sign in to continue
        </Typography>
      </Container>
    );
  }

  return (
    <Container maxWidth="md" sx={{ 
      minHeight: '100vh', 
      display: 'flex', 
      alignItems: 'center',
      py: 4
    }}>
      <Paper sx={{ 
        width: '100%', 
        p: 4,
        backgroundColor: '#4a4a4a',
        borderRadius: 2,
      }}>
        {/* Header */}
        <Box sx={{ textAlign: 'center', mb: 4 }}>
          <Typography variant="h4" component="h1" sx={{ 
            color: '#FF6B35',
            fontWeight: 'bold',
            mb: 2
          }}>
            Welcome to CredAhead!
          </Typography>
          <Typography variant="h6" sx={{ 
            color: '#E0E0E0',
            mb: 2
          }}>
            Help us personalize your experience
          </Typography>
          <Typography variant="body1" sx={{ 
            color: '#B0B0B0',
            maxWidth: '600px',
            mx: 'auto'
          }}>
            Please answer a few quick questions so we can better understand our users and improve your learning experience.
          </Typography>
        </Box>

        {/* Progress indicator */}
        <Box sx={{ mb: 4 }}>
          <Typography variant="body2" sx={{ color: '#B0B0B0', mb: 1, textAlign: 'center' }}>
            Step 2 of 3: Demographic Survey
          </Typography>
          <LinearProgress 
            variant="determinate" 
            value={66} 
            sx={{
              height: 6,
              borderRadius: 3,
              backgroundColor: 'rgba(255, 255, 255, 0.2)',
              '& .MuiLinearProgress-bar': {
                backgroundColor: '#FF6B35',
              },
            }}
          />
        </Box>

        {error && (
          <Alert severity="error" sx={{ mb: 3 }}>
            {error}
          </Alert>
        )}

        <Box component="form" onSubmit={handleSubmit}>
          {/* Age Range */}
          <FormControl fullWidth margin="normal" sx={{ mb: 3 }}>
            <InputLabel sx={{ 
              color: '#E0E0E0',
              '&.Mui-focused': { color: '#FF6B35' }
            }}>
              Age Range *
            </InputLabel>
            <Select
              value={ageRange}
              onChange={(e) => setAgeRange(e.target.value)}
              label="Age Range *"
              sx={{
                '& .MuiOutlinedInput-notchedOutline': {
                  borderColor: '#666',
                },
                '&:hover .MuiOutlinedInput-notchedOutline': {
                  borderColor: '#FF6B35',
                },
                '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                  borderColor: '#FF6B35',
                },
                '& .MuiSelect-select': {
                  color: '#E0E0E0',
                }
              }}
            >
              {AGE_RANGES.map((range) => (
                <MenuItem key={range} value={range}>
                  {range}
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          {/* Location */}
          <TextField
            margin="normal"
            required
            fullWidth
            label="Location (City/Town)"
            value={location}
            onChange={(e) => setLocation(e.target.value)}
            placeholder="Enter your city or town"
            sx={{
              mb: 3,
              '& .MuiOutlinedInput-root': {
                '& fieldset': {
                  borderColor: '#666',
                },
                '&:hover fieldset': {
                  borderColor: '#FF6B35',
                },
                '&.Mui-focused fieldset': {
                  borderColor: '#FF6B35',
                },
              },
              '& .MuiInputLabel-root': {
                color: '#E0E0E0',
                '&.Mui-focused': {
                  color: '#FF6B35',
                },
              },
              '& .MuiInputBase-input': {
                color: '#E0E0E0',
              }
            }}
          />

          {/* Occupation */}
          <FormControl fullWidth margin="normal" sx={{ mb: 4 }}>
            <InputLabel sx={{ 
              color: '#E0E0E0',
              '&.Mui-focused': { color: '#FF6B35' }
            }}>
              Occupation *
            </InputLabel>
            <Select
              value={occupation}
              onChange={(e) => setOccupation(e.target.value)}
              label="Occupation *"
              sx={{
                '& .MuiOutlinedInput-notchedOutline': {
                  borderColor: '#666',
                },
                '&:hover .MuiOutlinedInput-notchedOutline': {
                  borderColor: '#FF6B35',
                },
                '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                  borderColor: '#FF6B35',
                },
                '& .MuiSelect-select': {
                  color: '#E0E0E0',
                }
              }}
            >
              {OCCUPATIONS.map((job) => (
                <MenuItem key={job} value={job}>
                  {job}
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          {/* Continue Button */}
          <Button
            type="submit"
            fullWidth
            variant="contained"
            disabled={!isFormComplete || loading}
            sx={{ 
              py: 2,
              fontSize: '1.1rem',
              fontWeight: 'bold',
              backgroundColor: isFormComplete ? '#FF6B35' : '#666',
              '&:hover': {
                backgroundColor: isFormComplete ? '#e55a2b' : '#666',
              },
              '&:disabled': {
                backgroundColor: '#666',
                color: '#999'
              }
            }}
          >
            {loading ? 'Saving...' : 'Continue to Assessment'}
          </Button>
        </Box>

        {/* Footer note */}
        <Box sx={{ mt: 3, textAlign: 'center' }}>
          <Typography variant="body2" sx={{ color: '#999', fontSize: '0.9rem' }}>
            Your information is secure and will only be used to improve our platform.
          </Typography>
        </Box>
      </Paper>
    </Container>
  );
}