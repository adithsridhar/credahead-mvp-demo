'use client';

import { Container, Typography, Box, Button, Card, CardContent, Grid } from '@mui/material';
import { useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';
import { calculateModulePerformance, formatDuration, type ModulePerformance } from '@/lib/utils/modulePerformance';
import type { AssessmentResponse } from '@/lib/utils/scoring';

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
  const router = useRouter();
  const [modulePerformance, setModulePerformance] = useState<ModulePerformance[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  
  // Calculate accuracy percentage
  const accuracy = Math.round((correctAnswers / totalQuestions) * 100);
  
  // Load module performance data
  useEffect(() => {
    const loadModulePerformance = async () => {
      try {
        const performance = await calculateModulePerformance(responses);
        setModulePerformance(performance);
      } catch (error) {
        console.error('Error calculating module performance:', error);
      } finally {
        setIsLoading(false);
      }
    };
    
    loadModulePerformance();
  }, [responses]);

  const handleContinue = () => {
    onContinue();
    router.push('/pathway');
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
          variant="h3" 
          sx={{ 
            color: '#FF6B35', 
            fontWeight: 'bold', 
            textAlign: 'center',
            mb: 2 
          }}
        >
          Assessment Results
        </Typography>
        
        <Typography 
          variant="h4" 
          sx={{ 
            color: '#4CAF50', 
            textAlign: 'center',
            mb: 4 
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
                        borderRadius: 1
                      }}>
                        <Typography variant="caption" sx={{ 
                          color: '#E0E0E0',
                          display: 'block',
                          mb: 0.5,
                          fontSize: '0.7rem'
                        }}>
                          {module.moduleName}
                        </Typography>
                        <Typography sx={{ 
                          fontWeight: 'bold',
                          fontSize: '1rem',
                          color: getScoreColor(module.accuracy)
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
              <Typography variant="h3" sx={{ color: '#4CAF50', fontWeight: 'bold' }}>
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
              <Typography variant="h3" sx={{ color: '#4CAF50', fontWeight: 'bold' }}>
                {accuracy}%
              </Typography>
            </Box>
          </Grid>

          {/* Time Taken */}
          <Grid item xs={12} md={4}>
            <Box sx={{ 
              backgroundColor: '#5a5a5a', 
              p: 3, 
              borderRadius: 2, 
              textAlign: 'center' 
            }}>
              <Typography variant="body1" sx={{ color: '#E0E0E0', mb: 1 }}>
                Time Taken
              </Typography>
              <Typography variant="h3" sx={{ color: '#4CAF50', fontWeight: 'bold' }}>
                {formatDuration(duration)}
              </Typography>
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
            Continue to Learning Pathway
          </Button>
        </Box>
      </Card>
    </Container>
  );
}