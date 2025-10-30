'use client';

import { Container, Typography, Box, Button } from '@mui/material';
import { TrendingUp } from '@mui/icons-material';
import { useRouter } from 'next/navigation';

export default function PathwayComingSoonPage() {
  const router = useRouter();

  return (
    <Container maxWidth="md" sx={{ py: 8, textAlign: 'center', minHeight: '100vh', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
      <Box sx={{ mb: 4 }}>
        <TrendingUp sx={{ fontSize: 80, color: '#FF6B35', mb: 2 }} />
        
        <Typography 
          variant="h3" 
          sx={{ 
            color: 'white', 
            fontWeight: 'bold',
            mb: 2,
            fontSize: { xs: '2rem', sm: '2.5rem', md: '3rem' }
          }}
        >
          Learning Pathway
        </Typography>
        
        <Typography 
          variant="h5" 
          sx={{ 
            color: '#4CAF50',
            mb: 4,
            fontSize: { xs: '1.25rem', sm: '1.5rem', md: '1.875rem' }
          }}
        >
          🎯 Coming Soon!!
        </Typography>
        
        <Typography 
          variant="body1" 
          sx={{ 
            color: '#E0E0E0',
            mb: 4,
            lineHeight: 1.6,
            fontSize: { xs: '1rem', sm: '1.125rem' }
          }}
        >
          Boost your literacy score with interactive quizzes and structured learning content! 
          Our adaptive learning pathway will guide you through personalized financial education.
        </Typography>
        
        <Typography 
          variant="body2" 
          sx={{ 
            color: '#B0B0B0',
            mb: 4,
            fontStyle: 'italic'
          }}
        >
          Building an engaging and effective learning experience tailored to your progress.
        </Typography>
      </Box>
      
      <Button
        variant="contained"
        onClick={() => router.push('/dashboard')}
        sx={{
          backgroundColor: '#FF6B35',
          '&:hover': {
            backgroundColor: '#e55a2b',
          },
          px: 4,
          py: 1.5,
          fontSize: '1.1rem',
          fontWeight: 'bold',
          alignSelf: 'center'
        }}
      >
        Back to Dashboard
      </Button>
    </Container>
  );
}