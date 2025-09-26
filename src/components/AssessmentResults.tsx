'use client';

import { Container, Typography, Box, Button, Card, CardContent, Grid } from '@mui/material';
import { useRouter } from 'next/navigation';

interface AssessmentResultsProps {
  score: number;
  correctAnswers: number;
  totalQuestions: number;
  onContinue: () => void;
}

export default function AssessmentResults({ 
  score, 
  correctAnswers, 
  totalQuestions = 24,
  onContinue 
}: AssessmentResultsProps) {
  const router = useRouter();
  
  // Calculate accuracy percentage
  const accuracy = Math.round((correctAnswers / totalQuestions) * 100);
  
  // Determine literacy level based on score
  const getLiteracyLevel = (score: number): string => {
    if (score >= 1 && score <= 3) return 'Basic';
    if (score >= 4 && score <= 7) return 'Intermediate';
    if (score >= 8 && score <= 10) return 'Advanced';
    return 'Basic';
  };
  
  const literacyLevel = getLiteracyLevel(score);

  const handleContinue = () => {
    onContinue();
    router.push('/pathway');
  };

  return (
    <Container maxWidth="md" sx={{ 
      minHeight: '100vh', 
      display: 'flex', 
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      py: 4 
    }}>
      {/* Congratulations Header */}
      <Typography 
        variant="h2" 
        sx={{ 
          color: '#FF6B35', 
          fontWeight: 'bold',
          mb: 3,
          textAlign: 'center',
          fontSize: { xs: '2.5rem', md: '3.5rem' }
        }}
      >
        Congratulations!!
      </Typography>

      {/* Subheader */}
      <Typography 
        variant="h5" 
        sx={{ 
          color: '#E0E0E0',
          mb: 4,
          textAlign: 'center',
          fontWeight: 'normal'
        }}
      >
        Your Financial Literacy Score is
      </Typography>

      {/* Main Score Box */}
      <Card sx={{ 
        backgroundColor: '#4a4a4a',
        borderRadius: 3,
        mb: 4,
        minWidth: { xs: '280px', sm: '350px' },
        boxShadow: '0 8px 32px rgba(0,0,0,0.3)'
      }}>
        <CardContent sx={{ 
          textAlign: 'center',
          py: 4,
          px: 3
        }}>
          <Typography 
            variant="h1" 
            sx={{ 
              color: '#FF6B35',
              fontWeight: 'bold',
              mb: 2,
              fontSize: { xs: '4rem', md: '5rem' },
              lineHeight: 1
            }}
          >
            {score}
          </Typography>
          <Typography 
            variant="h4" 
            sx={{ 
              color: '#E0E0E0',
              fontWeight: 'medium',
              fontSize: { xs: '1.5rem', md: '2rem' }
            }}
          >
            {literacyLevel}
          </Typography>
        </CardContent>
      </Card>

      {/* Stats Row */}
      <Grid container spacing={2} sx={{ mb: 4, maxWidth: '600px' }}>
        {/* Questions Correct */}
        <Grid item xs={4}>
          <Card sx={{ backgroundColor: '#4a4a4a', borderRadius: 2 }}>
            <CardContent sx={{ textAlign: 'center', py: 2 }}>
              <Typography 
                variant="body2" 
                sx={{ 
                  color: '#E0E0E0',
                  mb: 1,
                  fontSize: { xs: '0.75rem', sm: '0.875rem' }
                }}
              >
                Questions
              </Typography>
              <Typography 
                variant="body2" 
                sx={{ 
                  color: '#E0E0E0',
                  mb: 2,
                  fontSize: { xs: '0.75rem', sm: '0.875rem' }
                }}
              >
                Correct
              </Typography>
              <Typography 
                variant="h4" 
                sx={{ 
                  color: '#FF6B35',
                  fontWeight: 'bold',
                  fontSize: { xs: '1.5rem', sm: '2rem' }
                }}
              >
                {correctAnswers}
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        {/* Total Questions */}
        <Grid item xs={4}>
          <Card sx={{ backgroundColor: '#4a4a4a', borderRadius: 2 }}>
            <CardContent sx={{ textAlign: 'center', py: 2 }}>
              <Typography 
                variant="body2" 
                sx={{ 
                  color: '#E0E0E0',
                  mb: 1,
                  fontSize: { xs: '0.75rem', sm: '0.875rem' }
                }}
              >
                Total
              </Typography>
              <Typography 
                variant="body2" 
                sx={{ 
                  color: '#E0E0E0',
                  mb: 2,
                  fontSize: { xs: '0.75rem', sm: '0.875rem' }
                }}
              >
                Questions
              </Typography>
              <Typography 
                variant="h4" 
                sx={{ 
                  color: '#FF6B35',
                  fontWeight: 'bold',
                  fontSize: { xs: '1.5rem', sm: '2rem' }
                }}
              >
                {totalQuestions}
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        {/* Accuracy */}
        <Grid item xs={4}>
          <Card sx={{ backgroundColor: '#4a4a4a', borderRadius: 2 }}>
            <CardContent sx={{ textAlign: 'center', py: 2 }}>
              <Typography 
                variant="body2" 
                sx={{ 
                  color: '#E0E0E0',
                  mb: 1,
                  fontSize: { xs: '0.75rem', sm: '0.875rem' }
                }}
              >
                Accuracy
              </Typography>
              <Typography 
                variant="body2" 
                sx={{ 
                  color: '#E0E0E0',
                  mb: 2,
                  fontSize: { xs: '0.75rem', sm: '0.875rem' },
                  visibility: 'hidden'
                }}
              >
                &nbsp;
              </Typography>
              <Typography 
                variant="h4" 
                sx={{ 
                  color: '#FF6B35',
                  fontWeight: 'bold',
                  fontSize: { xs: '1.5rem', sm: '2rem' }
                }}
              >
                {accuracy}%
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Continue Button */}
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
          fontSize: '1.1rem',
          fontWeight: 'bold',
          borderRadius: 2,
          textTransform: 'none',
          minWidth: '200px'
        }}
      >
        Continue
      </Button>
    </Container>
  );
}