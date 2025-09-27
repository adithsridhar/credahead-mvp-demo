'use client';

import Link from 'next/link';
import { useAuth } from '@/contexts/AuthContext';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Dialog, DialogContent, DialogTitle, TextField, Button, Alert, Box } from '@mui/material';

export default function HomePage() {
  const { user, appUser, loading, signIn } = useAuth();
  const router = useRouter();
  const [showAdminModal, setShowAdminModal] = useState(false);
  const [adminPassword, setAdminPassword] = useState('');
  const [adminLoading, setAdminLoading] = useState(false);
  const [adminError, setAdminError] = useState('');

  // Redirect authenticated users based on their completion status
  useEffect(() => {
    if (!loading && user && appUser) {
      // If user hasn't completed demographic survey, redirect to survey
      if (!appUser.survey_completed) {
        router.push('/auth/demographic-survey');
      }
      // If user completed survey but not assessment, redirect to assessment
      else if (!appUser.assessment_taken) {
        router.push('/assessment');
      }
      // Otherwise redirect to pathway
      else {
        router.push('/pathway');
      }
    }
  }, [user, appUser, loading, router]);

  // Handle admin authentication
  const handleAdminLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!adminPassword) {
      setAdminError('Please enter the admin password');
      return;
    }

    try {
      setAdminLoading(true);
      setAdminError('');
      
      // Simple password check
      if (adminPassword === 'admin') {
        // Close modal and redirect to admin dashboard
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

  // Show landing page only for unauthenticated users
  if (loading) {
    return (
      <main className="min-h-screen flex flex-col items-center justify-center p-8">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-gray-300">Loading...</p>
        </div>
      </main>
    );
  }

  // If user is authenticated, they'll be redirected, so show loading state
  if (user && appUser) {
    return (
      <main className="min-h-screen flex flex-col items-center justify-center p-8">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-gray-300">Redirecting...</p>
        </div>
      </main>
    );
  }

  // Show landing page for unauthenticated users
  return (
    <main className="min-h-screen flex flex-col items-center justify-center p-8">
      <div className="text-center max-w-2xl">
        <h1 className="text-5xl font-bold mb-6 text-primary">
          Welcome to CredAhead
        </h1>
        <p className="text-xl mb-8 text-gray-300">
          Master your financial literacy with our adaptive assessment and personalized learning pathway.
        </p>
        
        <div className="space-y-4">
          <Link
            href="/auth/signup"
            className="block bg-primary hover:bg-primary/80 text-white px-8 py-3 rounded-lg text-lg font-semibold transition-colors"
          >
            Get Started - Sign Up
          </Link>
          
          <Link
            href="/auth/signin"
            className="block bg-gray-700 hover:bg-gray-600 text-white px-8 py-3 rounded-lg text-lg font-semibold transition-colors"
          >
            Already have an account? Sign In
          </Link>
          
          <div className="mt-8 pt-8 border-t border-gray-600">
            <div className="space-y-2">
              <button
                onClick={() => setShowAdminModal(true)}
                className="block bg-gray-800 hover:bg-gray-700 text-white px-6 py-2 rounded-lg text-sm transition-colors w-full text-left"
              >
                Admin Dashboard
              </button>
            </div>
          </div>
        </div>
      </div>

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
    </main>
  );
}