'use client';

import { Container, Box, Typography, Button } from '@mui/material';
import { useRouter } from 'next/navigation';
import { Construction } from '@mui/icons-material';

interface ComingSoonProps {
  feature: string;
  description?: string;
}

export default function ComingSoon({ feature, description }: ComingSoonProps) {
  const router = useRouter();

  return (
    <Container maxWidth="md" sx={{ 
      py: 8, 
      textAlign: 'center',
      minHeight: '80vh',
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'center',
      alignItems: 'center'
    }}>
      <Box sx={{ mb: 4 }}>
        <Construction sx={{ 
          fontSize: 80, 
          color: '#FF6B35', 
          mb: 3 
        }} />
        
        <Typography variant="h3" component="h1" gutterBottom sx={{
          fontWeight: 600,
          color: '#E0E0E0',
          mb: 2
        }}>
          {feature} Coming Soon
        </Typography>
        
        <Typography variant="h6" sx={{
          color: '#B0B0B0',
          mb: 4,
          maxWidth: '600px',
          mx: 'auto',
          lineHeight: 1.6
        }}>
          {description || `We're working hard to bring you ${feature.toLowerCase()}. This feature will be available in a future update.`}
        </Typography>

        <Typography variant="body1" sx={{
          color: '#888',
          mb: 4
        }}>
          In the meantime, you can take your financial literacy assessment and explore the admin dashboard.
        </Typography>
      </Box>

      <Box sx={{ 
        display: 'flex', 
        gap: 2, 
        flexDirection: { xs: 'column', sm: 'row' },
        alignItems: 'center'
      }}>
        <Button
          variant="contained"
          onClick={() => router.push('/assessment')}
          sx={{
            backgroundColor: '#FF6B35',
            color: 'white',
            px: 4,
            py: 1.5,
            fontSize: '1rem',
            fontWeight: 600,
            borderRadius: 2,
            textTransform: 'none',
            '&:hover': {
              backgroundColor: '#E55A2B',
            }
          }}
        >
          Take Assessment
        </Button>
        
        <Button
          variant="outlined"
          onClick={() => router.push('/')}
          sx={{
            borderColor: '#666',
            color: '#E0E0E0',
            px: 4,
            py: 1.5,
            fontSize: '1rem',
            borderRadius: 2,
            textTransform: 'none',
            '&:hover': {
              borderColor: '#888',
              backgroundColor: 'rgba(255, 255, 255, 0.05)'
            }
          }}
        >
          Go Home
        </Button>
      </Box>
    </Container>
  );
}