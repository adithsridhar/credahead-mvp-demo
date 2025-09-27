'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Container, Paper, TextField, Button, Typography, Box, Alert, Dialog, DialogContent, DialogTitle } from '@mui/material';
import { useAuth } from '@/contexts/AuthContext';

export default function SignInPage() {
  const router = useRouter();
  const { signIn } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showAdminModal, setShowAdminModal] = useState(false);
  const [adminPassword, setAdminPassword] = useState('');
  const [adminLoading, setAdminLoading] = useState(false);
  const [adminError, setAdminError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email || !password) {
      setError('Please fill in all fields');
      return;
    }

    try {
      setLoading(true);
      setError('');
      await signIn(email, password);
      
      // Let the main page handle redirect logic based on user completion status
      router.push('/');
    } catch (error: any) {
      setError(error.message || 'Failed to sign in');
    } finally {
      setLoading(false);
    }
  };

  const handleAdminLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!adminPassword) {
      setAdminError('Please enter the admin password');
      return;
    }

    try {
      setAdminLoading(true);
      setAdminError('');
      
      if (adminPassword === 'admin') {
        setShowAdminModal(false);
        setAdminPassword('');
        router.push('/admin');
      } else {
        setAdminError('Invalid admin password');
      }
    } catch (error: any) {
      setAdminError('Authentication failed');
    } finally {
      setAdminLoading(false);
    }
  };

  return (
    <Container maxWidth="sm" sx={{ 
      minHeight: '100vh', 
      display: 'flex', 
      alignItems: 'center',
      py: 4
    }}>
      <Paper sx={{ 
        width: '100%', 
        p: 4,
        backgroundColor: '#4a4a4a',
        borderRadius: 2,
      }}>
        <Typography variant="h4" component="h1" gutterBottom sx={{ 
          textAlign: 'center',
          color: '#FF6B35',
          fontWeight: 'bold',
          mb: 3
        }}>
          Sign In
        </Typography>

        {error && (
          <Alert severity="error" sx={{ mb: 3 }}>
            {error}
          </Alert>
        )}

        <Box component="form" onSubmit={handleSubmit} sx={{ mt: 1 }}>
          <TextField
            margin="normal"
            required
            fullWidth
            id="email"
            label="Email Address"
            name="email"
            autoComplete="email"
            autoFocus
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
            autoComplete="current-password"
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
          <Button
            type="submit"
            fullWidth
            variant="contained"
            disabled={loading}
            sx={{ 
              mt: 3, 
              mb: 2,
              backgroundColor: '#FF6B35',
              '&:hover': {
                backgroundColor: '#e55a2b',
              },
              py: 1.5,
            }}
          >
            {loading ? 'Signing In...' : 'Sign In'}
          </Button>
          <Box sx={{ textAlign: 'center' }}>
            <Link href="/auth/signup" style={{ color: '#FF6B35', textDecoration: 'none' }}>
              Don't have an account? Sign Up
            </Link>
          </Box>
          
          <Box sx={{ mt: 3, pt: 3, borderTop: '1px solid #666', textAlign: 'center' }}>
            <Button
              onClick={() => setShowAdminModal(true)}
              sx={{
                color: '#999',
                textTransform: 'none',
                fontSize: '0.9rem',
                '&:hover': {
                  backgroundColor: 'rgba(255, 255, 255, 0.1)',
                  color: '#FF6B35'
                }
              }}
            >
              Admin Dashboard
            </Button>
          </Box>
        </Box>
      </Paper>

      {/* Admin Authentication Modal */}
      <Dialog 
        open={showAdminModal} 
        onClose={() => {
          setShowAdminModal(false);
          setAdminError('');
          setAdminPassword('');
        }}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle sx={{ color: '#FF6B35', fontWeight: 'bold' }}>
          Admin Access Required
        </DialogTitle>
        <DialogContent>
          {adminError && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {adminError}
            </Alert>
          )}
          
          <Box component="form" onSubmit={handleAdminLogin} sx={{ mt: 1 }}>
            <TextField
              margin="normal"
              required
              fullWidth
              label="Admin Password"
              type="password"
              value={adminPassword}
              onChange={(e) => setAdminPassword(e.target.value)}
              autoFocus
              sx={{
                '& .MuiOutlinedInput-root': {
                  '& fieldset': { borderColor: '#666' },
                  '&:hover fieldset': { borderColor: '#FF6B35' },
                  '&.Mui-focused fieldset': { borderColor: '#FF6B35' },
                },
                '& .MuiInputLabel-root': {
                  color: '#E0E0E0',
                  '&.Mui-focused': { color: '#FF6B35' },
                },
              }}
            />
            <Box sx={{ display: 'flex', gap: 2, mt: 3 }}>
              <Button
                onClick={() => {
                  setShowAdminModal(false);
                  setAdminError('');
                  setAdminPassword('');
                }}
                sx={{ color: '#666' }}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                variant="contained"
                disabled={adminLoading}
                sx={{
                  backgroundColor: '#FF6B35',
                  '&:hover': { backgroundColor: '#e55a2b' },
                  flex: 1,
                }}
              >
                {adminLoading ? 'Authenticating...' : 'Access Dashboard'}
              </Button>
            </Box>
          </Box>
        </DialogContent>
      </Dialog>
    </Container>
  );
}