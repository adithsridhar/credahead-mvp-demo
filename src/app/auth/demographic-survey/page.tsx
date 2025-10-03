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
      height: '100vh',
      display: 'flex', 
      alignItems: 'center',
      py: { xs: 2, sm: 3, md: 2 },
      px: { xs: 2, sm: 3, md: 4 }
    }}>
      <Paper sx={{ 
        width: '100%', 
        maxWidth: 600,
        margin: '0 auto',
        p: { xs: 3, sm: 4, md: 5 },
        backgroundColor: '#4a4a4a',
        borderRadius: { xs: 2, md: 3 },
        maxHeight: { xs: '90vh', sm: 'none' },
        overflow: { xs: 'auto', sm: 'visible' },
        display: 'flex',
        flexDirection: 'column',
        boxShadow: { md: '0 20px 60px rgba(0,0,0,0.3)' }
      }}>
        {/* Header */}
        <Box sx={{ textAlign: 'center', mb: { xs: 3, sm: 4 }, flexShrink: 0 }}>
          <Typography variant="h4" component="h1" sx={{ 
            color: '#FF6B35',
            fontWeight: 'bold',
            mb: { xs: 1.5, sm: 2, md: 2 },
            fontSize: { xs: '1.25rem', sm: '1.5rem', md: '1.75rem' },
            lineHeight: 1.2
          }}>
            Welcome to CredAhead!
          </Typography>
          <Typography variant="h6" sx={{ 
            color: '#E0E0E0',
            mb: { xs: 1.5, sm: 2, md: 2 },
            fontSize: { xs: '1rem', sm: '1.125rem', md: '1.25rem' },
            fontWeight: 500
          }}>
            Help us personalize your experience
          </Typography>
          <Typography variant="body1" sx={{ 
            color: '#B0B0B0',
            maxWidth: '500px',
            mx: 'auto',
            fontSize: { xs: '0.875rem', sm: '0.9375rem', md: '1rem' },
            lineHeight: 1.5
          }}>
            Please answer a few quick questions so we can better understand our users and improve your learning experience.
          </Typography>
        </Box>

        {/* Progress indicator */}
        <Box sx={{ mb: { xs: 3, sm: 4 }, flexShrink: 0 }}>
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

        <Box component="form" onSubmit={handleSubmit} sx={{ flexGrow: 1, display: 'flex', flexDirection: 'column' }}>
          {/* Age Range */}
          <FormControl fullWidth margin="normal" sx={{ mb: { xs: 2, sm: 3 } }}>
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
              mb: { xs: 2, sm: 3 },
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
          <FormControl fullWidth margin="normal" sx={{ mb: { xs: 3, sm: 4 } }}>
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
              height: { xs: '48px', sm: '52px', md: '56px' },
              fontSize: { xs: '0.875rem', sm: '0.9375rem', md: '1rem' },
              fontWeight: 600,
              borderRadius: { xs: '8px', md: '12px' },
              textTransform: 'none',
              backgroundColor: isFormComplete ? '#FF6B35' : '#666',
              transition: 'all 0.2s ease',
              '&:hover': {
                backgroundColor: isFormComplete ? '#e55a2b' : '#666',
                transform: isFormComplete && { md: 'translateY(-1px)' },
                boxShadow: isFormComplete && { md: '0 4px 12px rgba(255,107,53,0.3)' }
              },
              '&:disabled': {
                backgroundColor: '#666',
                color: '#999'
              },
              mt: 'auto'
            }}
          >
            {loading ? 'Saving...' : 'Continue to Assessment'}
          </Button>
        </Box>

        {/* Footer note */}
        <Box sx={{ mt: { xs: 2, sm: 3 }, textAlign: 'center', flexShrink: 0 }}>
          <Typography variant="body2" sx={{ 
            color: '#999', 
            fontSize: { xs: '0.8rem', sm: '0.9rem' }
          }}>
            Your information is secure and will only be used to improve our platform.
          </Typography>
        </Box>
      </Paper>
    </Container>
  );
}