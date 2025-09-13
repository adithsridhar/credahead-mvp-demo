'use client';

import { Box, Typography, Button, Container, Paper } from '@mui/material';

export default function PreAssessmentScreen({ onStart }: { onStart: () => void }) {
  return (
    <Container maxWidth="md" sx={{ minHeight: '100vh', display: 'flex', alignItems: 'center' }}>
      <Paper sx={{ 
        width: '100%', 
        p: 6, 
        textAlign: 'center',
        backgroundColor: '#4a4a4a',
        borderRadius: 3,
        boxShadow: '0 8px 32px rgba(0,0,0,0.3)',
      }}>
        <Typography variant="h3" component="h1" gutterBottom sx={{ 
          color: '#FF6B35', 
          fontWeight: 'bold',
          mb: 3
        }}>
          Let's check your current financial literacy score!
        </Typography>

        <Typography variant="h6" sx={{ 
          mb: 4, 
          color: '#E0E0E0',
          lineHeight: 1.6,
          maxWidth: '600px',
          margin: '0 auto 2rem'
        }}>
          This assessment will help us understand your current level of financial knowledge 
          and create a personalized learning pathway just for you.
        </Typography>

        <Box sx={{ mb: 4 }}>
          <Typography variant="body1" sx={{ mb: 2, color: '#B0B0B0' }}>
            📋 24 adaptive questions
          </Typography>
          <Typography variant="body1" sx={{ mb: 2, color: '#B0B0B0' }}>
            ⏱️ Approximately 10-15 minutes
          </Typography>
          <Typography variant="body1" sx={{ mb: 2, color: '#B0B0B0' }}>
            🎯 Questions adapt based on your performance
          </Typography>
        </Box>
        
        <Button 
          variant="contained"
          size="large"
          onClick={onStart}
          sx={{
            backgroundColor: '#FF6B35',
            '&:hover': {
              backgroundColor: '#e55a2b',
            },
            px: 6,
            py: 2,
            fontSize: '1.25rem',
            fontWeight: 'bold',
            borderRadius: 2,
          }}
        >
          Start Assessment
        </Button>
      </Paper>
    </Container>
  );
}