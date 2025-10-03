'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Container, Paper, TextField, Button, Typography, Box, Alert } from '@mui/material';
import { useAuth } from '@/contexts/AuthContext';

export default function SignUpPage() {
  const router = useRouter();
  const { signUp } = useAuth();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!name || !email || !password || !confirmPassword) {
      setError('Please fill in all fields');
      return;
    }

    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    if (password.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }

    try {
      setLoading(true);
      setError('');
      
      await signUp(email, password, name);
      
      // Show verification message - no auto redirects or signin attempts
      setSuccess('Verification email sent. Please check your inbox and validate using the link to proceed.');
      
    } catch (error: any) {
      setError(error.message || 'Failed to create account');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container maxWidth="sm" sx={{ 
      minHeight: '100vh', 
      height: '100vh',
      display: 'flex', 
      alignItems: 'center',
      py: { xs: 2, sm: 3, md: 2 },
      px: { xs: 2, sm: 3, md: 4 }
    }}>
      <Paper sx={{ 
        width: '100%', 
        p: { xs: 3, sm: 4, md: 5 },
        backgroundColor: '#4a4a4a',
        borderRadius: { xs: 2, md: 3 },
        maxHeight: { xs: '90vh', sm: 'none' },
        overflow: { xs: 'auto', sm: 'visible' },
        display: 'flex',
        flexDirection: 'column',
        boxShadow: { md: '0 20px 60px rgba(0,0,0,0.3)' }
      }}>
        <Typography variant="h4" component="h1" gutterBottom sx={{ 
          textAlign: 'center',
          color: '#FF6B35',
          fontWeight: 'bold',
          mb: { xs: 2, sm: 3, md: 2 },
          fontSize: { xs: '1.25rem', sm: '1.375rem', md: '1.75rem' },
          lineHeight: 1.2
        }}>
          Sign Up
        </Typography>

        {error && (
          <Alert severity="error" sx={{ mb: 3 }}>
            {error}
          </Alert>
        )}

        {success && (
          <Alert severity="success" sx={{ mb: 3 }}>
            {success}
          </Alert>
        )}

        <Box component="form" onSubmit={handleSubmit} sx={{ 
          mt: { xs: 1, md: 2 }, 
          flexGrow: 1, 
          display: 'flex', 
          flexDirection: 'column' 
        }}>
          <TextField
            margin="normal"
            required
            fullWidth
            id="name"
            label="Full Name"
            name="name"
            autoComplete="name"
            autoFocus
            value={name}
            onChange={(e) => setName(e.target.value)}
            sx={{
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
            }}
          />
          <TextField
            margin="normal"
            required
            fullWidth
            id="email"
            label="Email Address"
            name="email"
            autoComplete="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            sx={{
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
            }}
          />
          <TextField
            margin="normal"
            required
            fullWidth
            name="password"
            label="Password"
            type="password"
            id="password"
            autoComplete="new-password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            sx={{
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
            }}
          />
          <TextField
            margin="normal"
            required
            fullWidth
            name="confirmPassword"
            label="Confirm Password"
            type="password"
            id="confirmPassword"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            sx={{
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
            }}
          />
          <Button
            type="submit"
            fullWidth
            variant="contained"
            disabled={loading || !!success}
            sx={{ 
              mt: { xs: 2, sm: 3, md: 4 }, 
              mb: { xs: 2, md: 3 },
              height: { xs: '48px', sm: '52px', md: '56px' },
              backgroundColor: '#FF6B35',
              borderRadius: { xs: '8px', md: '12px' },
              fontSize: { xs: '0.875rem', sm: '0.9375rem', md: '1rem' },
              fontWeight: 600,
              textTransform: 'none',
              transition: 'all 0.2s ease',
              '&:hover': {
                backgroundColor: '#e55a2b',
                transform: { md: 'translateY(-1px)' },
                boxShadow: { md: '0 4px 12px rgba(255,107,53,0.3)' }
              },
            }}
          >
            {loading ? 'Creating Account...' : 'Sign Up'}
          </Button>
          <Box sx={{ textAlign: 'center' }}>
            <Link href="/auth/signin" style={{ color: '#FF6B35', textDecoration: 'none' }}>
              Already have an account? Sign In
            </Link>
          </Box>
        </Box>
      </Paper>
    </Container>
  );
}