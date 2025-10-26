'use client';

import { Container, Typography, Box, Button } from '@mui/material';
import { Psychology } from '@mui/icons-material';
import { useRouter } from 'next/navigation';

export default function SocraticCornerPage() {
  const router = useRouter();

  return (
    <Container maxWidth="md" sx={{ py: 8, textAlign: 'center', minHeight: '100vh', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
      <Box sx={{ mb: 4 }}>
        <Psychology sx={{ fontSize: 80, color: '#FF6B35', mb: 2 }} />
        
        <Typography 
          variant="h3" 
          sx={{ 
            color: 'white', 
            fontWeight: 'bold',
            mb: 2,
            fontSize: { xs: '2rem', sm: '2.5rem', md: '3rem' }
          }}
        >
          Socratic Corner
        </Typography>
        
        <Typography 
          variant="h5" 
          sx={{ 
            color: '#4CAF50',
            mb: 4,
            fontSize: { xs: '1.25rem', sm: '1.5rem', md: '1.875rem' }
          }}
        >
          🤔 Coming Soon!!
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
          Interactive learning experience coming! Master financial topics through 
          guided questioning, critical thinking exercises, and personalized coaching.
        </Typography>
        
        <Typography 
          variant="body2" 
          sx={{ 
            color: '#B0B0B0',
            mb: 4,
            fontStyle: 'italic'
          }}
        >
          Developing an innovative approach to financial education through dialogue and discovery.
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