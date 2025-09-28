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
    <AppBar position="static" sx={{ backgroundColor: '#2d2d2d' }}>
      <Toolbar>
        <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
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
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <Typography variant="body2" sx={{ color: '#FF6B35' }}>
              Level {appUser.literacy_level}
            </Typography>
          </Box>
        )}

        <Box sx={{ display: 'flex', gap: 1 }}>
          {user ? (
            <>
              <Button color="inherit" component={Link} href="/pathway">
                Pathway
              </Button>
              <Button color="inherit" component={Link} href="/assessment">
                Assessment
              </Button>
              <Button color="inherit" onClick={handleSignOut}>
                Sign Out
              </Button>
            </>
          ) : (
            <>
              <Button color="inherit" component={Link} href="/auth/signin">
                Sign In
              </Button>
            </>
          )}
        </Box>
      </Toolbar>
    </AppBar>
  );
}