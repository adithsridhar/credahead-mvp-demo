'use client';

import { Container, Typography, Box, Button, Card, CardContent, Grid } from '@mui/material';
import { useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';
import { formatDuration } from '@/lib/utils/modulePerformance';
import { calculatePercentile, type AssessmentResponse } from '@/lib/utils/scoring';

interface AssessmentResultsProps {
  score: number;
  correctAnswers: number;
  totalQuestions: number;
  duration: number;
  responses: AssessmentResponse[];
  onContinue: () => void;
}

export default function AssessmentResults({ 
  score, 
  correctAnswers, 
  totalQuestions = 24,
  duration,
  responses,
  onContinue 
}: AssessmentResultsProps) {
  console.log('🔥 ASSESSMENT RESULTS COMPONENT RENDERED - CHECK THIS LOG!');
  console.log('🔥 RESPONSES PASSED TO COMPONENT:', responses);
  const router = useRouter();
  const [percentile, setPercentile] = useState<number | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  
  // Calculate accuracy percentage
  const accuracy = Math.round((correctAnswers / totalQuestions) * 100);
  
  // Load module performance data and calculate percentile
  useEffect(() => {
    console.log('🚀 AssessmentResults useEffect triggered!');
    console.log('📊 Received responses:', responses);
    console.log('📊 Responses length:', responses?.length || 0);
    
    const loadData = async () => {
      try {
        // Calculate percentile for user's score
        const userPercentile = await calculatePercentile(score);
        setPercentile(userPercentile);
      } catch (error) {
        console.error('Error loading assessment data:', error);
      } finally {
        setIsLoading(false);
      }
    };
    
    loadData();
  }, [score]);

  const handleContinue = () => {
    onContinue();
    // Redirect to home page instead of pathway since pathway is disabled
    router.push('/');
  };


  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Card sx={{ 
        backgroundColor: '#4a4a4a', 
        borderRadius: 2, 
        mb: 4,
        p: 4
      }}>
        {/* Header */}
        <Typography 
          variant="h4" 
          sx={{ 
            color: '#FF6B35', 
            fontWeight: 'bold', 
            textAlign: 'center',
            mb: 2,
            fontSize: { xs: '1.25rem', sm: '1.375rem', md: '1.75rem' }
          }}
        >
          Assessment Completed!
        </Typography>
        
        <Typography 
          variant="h5" 
          sx={{ 
            color: '#4CAF50', 
            textAlign: 'center',
            mb: 4,
            fontSize: { xs: '1.125rem', sm: '1.25rem', md: '1.5rem' }
          }}
        >
          🎉 Congratulations!!
        </Typography>

        {/* Top Row: Literacy Level */}
        <Grid container spacing={3} sx={{ mb: 4 }}>
          {/* Literacy Level Box */}
          <Grid item xs={12}>
            <Box sx={{ 
              backgroundColor: '#5a5a5a', 
              p: 3, 
              borderRadius: 2, 
              textAlign: 'center',
              maxWidth: '600px',
              mx: 'auto'
            }}>
              <Typography variant="h6" sx={{ color: '#FF6B35', mb: 2 }}>
                Your Literacy Level
              </Typography>
              <Typography variant="h1" sx={{ 
                color: '#4CAF50', 
                fontWeight: 'bold',
                fontSize: '4rem'
              }}>
                {score}
              </Typography>
            </Box>
          </Grid>
        </Grid>

        {/* Bottom Row: Statistics */}
        <Grid container spacing={3} sx={{ mb: 4 }}>
          {/* Questions Correct */}
          <Grid item xs={12} md={4}>
            <Box sx={{ 
              backgroundColor: '#5a5a5a', 
              p: 3, 
              borderRadius: 2, 
              textAlign: 'center' 
            }}>
              <Typography variant="body1" sx={{ color: '#E0E0E0', mb: 1 }}>
                Questions Correct
              </Typography>
              <Typography variant="h5" sx={{ 
                color: '#4CAF50', 
                fontWeight: 'bold',
                fontSize: { xs: '1.5rem', sm: '1.75rem', md: '2rem' }
              }}>
                {correctAnswers}/24
              </Typography>
            </Box>
          </Grid>

          {/* Accuracy */}
          <Grid item xs={12} md={4}>
            <Box sx={{ 
              backgroundColor: '#5a5a5a', 
              p: 3, 
              borderRadius: 2, 
              textAlign: 'center' 
            }}>
              <Typography variant="body1" sx={{ color: '#E0E0E0', mb: 1 }}>
                Accuracy
              </Typography>
              <Typography variant="h5" sx={{ 
                color: '#4CAF50', 
                fontWeight: 'bold',
                fontSize: { xs: '1.5rem', sm: '1.75rem', md: '2rem' }
              }}>
                {accuracy}%
              </Typography>
            </Box>
          </Grid>

          {/* Percentile */}
          <Grid item xs={12} md={4}>
            <Box sx={{ 
              backgroundColor: '#5a5a5a', 
              p: 3, 
              borderRadius: 2, 
              textAlign: 'center',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'center',
              minHeight: '120px'
            }}>
              {percentile !== null ? (
                <Typography variant="body1" sx={{ color: '#E0E0E0', lineHeight: 1.4 }}>
                  You were better than{' '}
                  <Typography component="span" sx={{ 
                    color: '#FF6B35', 
                    fontWeight: 'bold',
                    fontSize: '1.5em'
                  }}>
                    {percentile}%
                  </Typography>
                  {' '}of users
                </Typography>
              ) : (
                <Typography variant="body1" sx={{ color: '#9CA3AF' }}>
                  Calculating percentile...
                </Typography>
              )}
            </Box>
          </Grid>
        </Grid>

        {/* Continue Button */}
        <Box sx={{ textAlign: 'center' }}>
          <Button
            variant="contained"
            onClick={handleContinue}
            sx={{
              backgroundColor: '#FF6B35',
              '&:hover': {
                backgroundColor: '#e55a2b',
              },
              px: 6,
              py: 2,
              fontSize: '1.2rem',
              fontWeight: 'bold'
            }}
          >
            Continue
          </Button>
        </Box>
      </Card>
    </Container>
  );
}