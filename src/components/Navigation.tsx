'use client';

import Link from 'next/link';
import { useAuth } from '@/contexts/AuthContext';
import { useNavigationGuard } from '@/contexts/NavigationGuardContext';
import { AppBar, Toolbar, Typography, Button, Box } from '@mui/material';

export default function Navigation() {
  const { user, appUser, signOut } = useAuth();
  const { requestNavigation } = useNavigationGuard();

  const handleSignOut = async () => {
    try {
      await signOut();
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  return (
    <AppBar position="static" sx={{ 
      backgroundColor: '#2d2d2d',
      minHeight: { xs: '56px', sm: '64px' },
      boxShadow: { md: '0 2px 8px rgba(0,0,0,0.15)' }
    }}>
      <Toolbar sx={{ 
        minHeight: { xs: '56px', sm: '64px' },
        px: { xs: 2, sm: 3, md: 4 }
      }}>
        <Typography variant="h6" component="div" sx={{ 
          flexGrow: 1,
          fontSize: { xs: '1.125rem', sm: '1.25rem', md: '1.5rem' },
          fontWeight: 600
        }}>
          <span 
            onClick={() => requestNavigation('/pathway')}
            style={{ 
              textDecoration: 'none', 
              color: 'inherit', 
              cursor: 'pointer' 
            }}
          >
            CredAhead
          </span>
        </Typography>

        {appUser && (
          <Box sx={{ 
            display: 'flex', 
            alignItems: 'center', 
            gap: { xs: 1.5, sm: 2, md: 3 },
            mr: { xs: 2, sm: 3, md: 4 }
          }}>
            <Typography variant="body2" sx={{ 
              color: '#FF6B35',
              fontSize: { xs: '0.8rem', sm: '0.875rem', md: '1rem' },
              fontWeight: 600,
              display: { xs: 'none', sm: 'block' },
              background: 'rgba(255,107,53,0.1)',
              px: { sm: 1.5, md: 2 },
              py: { sm: 0.5, md: 0.75 },
              borderRadius: { sm: 1, md: 1.5 }
            }}>
              Level {appUser.literacy_level}
            </Typography>
          </Box>
        )}

        <Box sx={{ 
          display: 'flex', 
          gap: { xs: 1, sm: 1.5, md: 2 },
          flexWrap: 'nowrap'
        }}>
          {user ? (
            <>
              <Button 
                color="inherit" 
                component={Link} 
                href="/pathway"
                sx={{
                  fontSize: { xs: '0.8rem', sm: '0.875rem', md: '1rem' },
                  px: { xs: 1.5, sm: 2, md: 3 },
                  py: { md: 1 },
                  minWidth: { xs: 'auto', sm: '64px' },
                  borderRadius: { md: 2 },
                  transition: 'all 0.2s ease',
                  '&:hover': {
                    backgroundColor: { md: 'rgba(255,255,255,0.1)' }
                  }
                }}
              >
                Pathway
              </Button>
              <Button 
                color="inherit" 
                component={Link} 
                href="/assessment"
                sx={{
                  fontSize: { xs: '0.8rem', sm: '0.875rem', md: '1rem' },
                  px: { xs: 1.5, sm: 2, md: 3 },
                  py: { md: 1 },
                  minWidth: { xs: 'auto', sm: '64px' },
                  borderRadius: { md: 2 },
                  transition: 'all 0.2s ease',
                  display: { xs: 'none', sm: 'inline-flex' },
                  '&:hover': {
                    backgroundColor: { md: 'rgba(255,255,255,0.1)' }
                  }
                }}
              >
                Assessment
              </Button>
              <Button 
                color="inherit" 
                onClick={handleSignOut}
                sx={{
                  fontSize: { xs: '0.8rem', sm: '0.875rem', md: '1rem' },
                  px: { xs: 1.5, sm: 2, md: 3 },
                  py: { md: 1 },
                  minWidth: { xs: 'auto', sm: '64px' },
                  borderRadius: { md: 2 },
                  transition: 'all 0.2s ease',
                  '&:hover': {
                    backgroundColor: { md: 'rgba(255,255,255,0.1)' }
                  }
                }}
              >
                Sign Out
              </Button>
            </>
          ) : (
            <>
              <Button 
                color="inherit" 
                component={Link} 
                href="/auth/signin"
                sx={{
                  fontSize: { xs: '0.8rem', sm: '0.875rem', md: '1rem' },
                  px: { xs: 1.5, sm: 2, md: 3 },
                  py: { md: 1 },
                  minWidth: { xs: 'auto', sm: '64px' },
                  borderRadius: { md: 2 },
                  transition: 'all 0.2s ease',
                  '&:hover': {
                    backgroundColor: { md: 'rgba(255,255,255,0.1)' }
                  }
                }}
              >
                Sign In
              </Button>
            </>
          )}
        </Box>
      </Toolbar>
    </AppBar>
  );
}