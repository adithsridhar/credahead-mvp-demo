'use client';

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { AuthProvider } from '@/contexts/AuthContext';
import { NavigationGuardProvider } from '@/contexts/NavigationGuardContext';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import { useState, useEffect } from 'react';
import { useAppVersion } from '@/hooks/useVersionCheck';

// Material-UI theme configuration
const theme = createTheme({
  palette: {
    mode: 'dark',
    primary: {
      main: '#FF6B35',
    },
    secondary: {
      main: '#4CAF50',
    },
    background: {
      default: '#3b3b3b',
      paper: '#4a4a4a',
    },
    text: {
      primary: '#FFFFFF',
      secondary: '#E0E0E0',
    },
    error: {
      main: '#f44336',
    },
  },
  typography: {
    fontFamily: 'Inter, sans-serif',
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          textTransform: 'none',
          borderRadius: 8,
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          backgroundColor: '#4a4a4a',
          borderRadius: 12,
        },
      },
    },
  },
});

export function Providers({ children }: { children: React.ReactNode }) {
  const { version } = useAppVersion();
  
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            staleTime: 60 * 1000, // 1 minute
            gcTime: 5 * 60 * 1000, // 5 minutes
            refetchOnWindowFocus: false,
          },
        },
      })
  );

  // Log app version on startup
  useEffect(() => {
    console.log(`🚀 CredAhead App started - Version: ${version}`);
  }, [version]);

  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider theme={theme}>
        <CssBaseline />
        <AuthProvider>
          <NavigationGuardProvider>
            {children}
          </NavigationGuardProvider>
        </AuthProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
}