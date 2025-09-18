'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Container, Paper, Typography, Box, CircularProgress } from '@mui/material';
import { CheckCircle, Error } from '@mui/icons-material';

export default function VerifyPage() {
  const router = useRouter();
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');

  useEffect(() => {
    // Check if this page was reached after email verification
    // Supabase automatically handles the verification process
    // This page is just a landing page to show success and redirect to signin
    
    const timer = setTimeout(() => {
      setStatus('success');
      
      // Auto redirect to signin after 3 seconds
      const redirectTimer = setTimeout(() => {
        router.push('/auth/signin');
      }, 3000);

      return () => clearTimeout(redirectTimer);
    }, 1000);

    return () => clearTimeout(timer);
  }, [router]);

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
        textAlign: 'center'
      }}>
        {status === 'loading' && (
          <>
            <CircularProgress sx={{ color: '#FF6B35', mb: 3 }} />
            <Typography variant="h5" sx={{ color: '#E0E0E0', mb: 2 }}>
              Verifying your email...
            </Typography>
          </>
        )}

        {status === 'success' && (
          <>
            <CheckCircle sx={{ 
              fontSize: 60, 
              color: '#34D399', 
              mb: 3 
            }} />
            <Typography variant="h4" sx={{ 
              color: '#FF6B35',
              fontWeight: 'bold',
              mb: 2
            }}>
              Email Verified!
            </Typography>
            <Typography variant="h6" sx={{ 
              color: '#E0E0E0',
              mb: 3
            }}>
              Your account has been successfully verified.
            </Typography>
            <Typography variant="body1" sx={{ 
              color: '#B0B0B0',
              mb: 3
            }}>
              Redirecting to sign in page in 3 seconds...
            </Typography>
            <Link 
              href="/auth/signin" 
              style={{ 
                color: '#FF6B35', 
                textDecoration: 'none',
                fontSize: '1.1rem',
                fontWeight: 'bold'
              }}
            >
              Or click here to sign in now
            </Link>
          </>
        )}

        {status === 'error' && (
          <>
            <Error sx={{ 
              fontSize: 60, 
              color: '#EF4444', 
              mb: 3 
            }} />
            <Typography variant="h5" sx={{ 
              color: '#EF4444',
              mb: 2
            }}>
              Verification Failed
            </Typography>
            <Typography variant="body1" sx={{ 
              color: '#E0E0E0',
              mb: 3
            }}>
              There was an issue verifying your email. Please try again or contact support.
            </Typography>
            <Link 
              href="/auth/signup" 
              style={{ 
                color: '#FF6B35', 
                textDecoration: 'none',
                marginRight: '20px'
              }}
            >
              Try Signup Again
            </Link>
            <Link 
              href="/auth/signin" 
              style={{ 
                color: '#FF6B35', 
                textDecoration: 'none'
              }}
            >
              Go to Sign In
            </Link>
          </>
        )}
      </Paper>
    </Container>
  );
}