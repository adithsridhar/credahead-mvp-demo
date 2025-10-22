'use client';

import { Container, Typography, Box, Button, Card, CardContent, Grid } from '@mui/material';
import { useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';
import { calculateModulePerformance, formatDuration, type ModulePerformance } from '@/lib/utils/modulePerformance';
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
  const [modulePerformance, setModulePerformance] = useState<ModulePerformance[]>([]);
  const [percentile, setPercentile] = useState<number | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  
  // Calculate accuracy percentage
  const accuracy = Math.round((correctAnswers / totalQuestions) * 100);
  
  // Load module performance data and calculate percentile
  useEffect(() => {
    console.log('🚀 AssessmentResults useEffect triggered!');
    console.log('📊 Received responses:', responses);
    console.log('📊 Responses length:', responses?.length || 0);
    
    // CRITICAL FIX: Only process if we have valid responses
    if (!responses || responses.length === 0) {
      console.log('⏳ No responses yet, waiting...');
      setIsLoading(true);
      return;
    }
    
    console.log('✅ Valid responses found, processing...');
    
    const loadData = async () => {
      try {
        console.log('🔄 Starting calculateModulePerformance with responses:', responses);
        // Load module performance
        const performance = await calculateModulePerformance(responses);
        console.log('✅ Module performance calculated:', performance);
        setModulePerformance(performance);
        
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
  }, [responses, score]);

  const handleContinue = () => {
    onContinue();
    // Redirect to home page instead of pathway since pathway is disabled
    router.push('/');
  };

  const getScoreColor = (accuracy: number | null): string => {
    if (accuracy === null) return '#9CA3AF'; // Grey for NA
    if (accuracy >= 75) return '#4CAF50'; // Green for high
    if (accuracy >= 50) return '#FF9800'; // Orange for medium
    return '#F44336'; // Red for low
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
          Assessment Results
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
          ✅ Assessment Completed!
        </Typography>

        {/* Top Row: Literacy Level + Module Performance */}
        <Grid container spacing={3} sx={{ mb: 4 }}>
          {/* Literacy Level Box */}
          <Grid item xs={12} md={6}>
            <Box sx={{ 
              backgroundColor: '#5a5a5a', 
              p: 3, 
              borderRadius: 2, 
              textAlign: 'center',
              height: '100%'
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

          {/* Module Performance Box */}
          <Grid item xs={12} md={6}>
            <Box sx={{ 
              backgroundColor: '#5a5a5a', 
              p: 3, 
              borderRadius: 2,
              height: '100%'
            }}>
              <Typography variant="h6" sx={{ color: '#FF6B35', mb: 2, textAlign: 'center' }}>
                Performance by Module
              </Typography>
              {isLoading ? (
                <Box sx={{ textAlign: 'center', py: 2 }}>
                  <Typography sx={{ color: '#E0E0E0' }}>Loading...</Typography>
                </Box>
              ) : (
                <Grid container spacing={1}>
                  {modulePerformance.map((module) => (
                    <Grid item xs={3} key={module.moduleId}>
                      <Box sx={{ 
                        textAlign: 'center',
                        p: 1,
                        backgroundColor: '#4a4a4a',
                        borderRadius: 1,
                        height: '85px', // Fixed height based on longest module name
                        display: 'flex',
                        flexDirection: 'column',
                        justifyContent: 'space-between'
                      }}>
                        <Typography variant="caption" sx={{ 
                          color: '#E0E0E0',
                          display: 'block',
                          fontSize: '0.7rem',
                          lineHeight: 1.3,
                          flex: 1,
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          textAlign: 'center',
                          wordWrap: 'break-word',
                          hyphens: 'auto'
                        }}>
                          {module.moduleName}
                        </Typography>
                        <Typography sx={{ 
                          fontWeight: 'bold',
                          fontSize: '1rem',
                          color: getScoreColor(module.accuracy),
                          mt: 1
                        }}>
                          {module.accuracy === null ? 'NA' : `${module.accuracy}%`}
                        </Typography>
                      </Box>
                    </Grid>
                  ))}
                </Grid>
              )}
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