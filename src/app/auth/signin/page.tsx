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
      
      // Use secure admin login API
      const response = await fetch('/api/admin/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ password: adminPassword }),
      });
      
      const data = await response.json();
      
      if (response.ok && data.success) {
        // Authentication successful - JWT cookie is set automatically
        setShowAdminModal(false);
        setAdminPassword('');
        router.push('/admin');
      } else {
        setAdminError(data.error || 'Invalid admin password');
      }
    } catch (error: any) {
      console.error('Admin login error:', error);
      setAdminError('Authentication failed');
    } finally {
      setAdminLoading(false);
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
          Sign In
        </Typography>

        {error && (
          <Alert severity="error" sx={{ mb: 3 }}>
            {error}
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
            id="email"
            label="Email Address"
            name="email"
            autoComplete="email"
            autoFocus
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            sx={{
              mb: { xs: 2, md: 3 },
              '& .MuiOutlinedInput-root': {
                height: { xs: '48px', sm: '52px', md: '56px' },
                fontSize: { xs: '0.875rem', sm: '0.9375rem', md: '1rem' },
                '& fieldset': {
                  borderColor: '#666',
                  borderRadius: { xs: '8px', md: '12px' }
                },
                '&:hover fieldset': {
                  borderColor: '#FF6B35',
                },
                '&.Mui-focused fieldset': {
                  borderColor: '#FF6B35',
                  boxShadow: { md: '0 0 0 3px rgba(255,107,53,0.1)' }
                },
              },
              '& .MuiInputLabel-root': {
                color: '#E0E0E0',
                fontSize: { xs: '0.875rem', md: '1rem' },
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
              mb: { xs: 2, md: 3 },
              '& .MuiOutlinedInput-root': {
                height: { xs: '48px', sm: '52px', md: '56px' },
                fontSize: { xs: '0.875rem', sm: '0.9375rem', md: '1rem' },
                '& fieldset': {
                  borderColor: '#666',
                  borderRadius: { xs: '8px', md: '12px' }
                },
                '&:hover fieldset': {
                  borderColor: '#FF6B35',
                },
                '&.Mui-focused fieldset': {
                  borderColor: '#FF6B35',
                  boxShadow: { md: '0 0 0 3px rgba(255,107,53,0.1)' }
                },
              },
              '& .MuiInputLabel-root': {
                color: '#E0E0E0',
                fontSize: { xs: '0.875rem', md: '1rem' },
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
            {loading ? 'Signing In...' : 'Sign In'}
          </Button>
          <Box sx={{ textAlign: 'center', mb: { md: 2 } }}>
            <Link href="/auth/signup" style={{ 
              color: '#FF6B35', 
              textDecoration: 'none',
              fontSize: '14px'
            }}>
              Don't have an account? Sign Up
            </Link>
          </Box>
          
          <Box sx={{ 
            mt: { xs: 2, sm: 3, md: 2 }, 
            pt: { xs: 2, sm: 3, md: 2 }, 
            borderTop: '1px solid #666', 
            textAlign: 'center' 
          }}>
            <Button
              onClick={() => setShowAdminModal(true)}
              sx={{
                color: '#999',
                textTransform: 'none',
                fontSize: { xs: '0.75rem', sm: '0.8rem', md: '0.875rem' },
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