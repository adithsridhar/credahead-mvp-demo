'use client';

import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Typography,
  Box,
} from '@mui/material';
import { Warning } from '@mui/icons-material';

interface NavigationGuardContextType {
  isQuizActive: boolean;
  setQuizActive: (active: boolean) => void;
  requestNavigation: (targetPath: string) => void;
}

const NavigationGuardContext = createContext<NavigationGuardContextType | undefined>(undefined);

export function NavigationGuardProvider({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const [isQuizActive, setIsQuizActive] = useState(false);
  const [showWarning, setShowWarning] = useState(false);
  const [pendingNavigation, setPendingNavigation] = useState<string | null>(null);

  const setQuizActive = useCallback((active: boolean) => {
    setIsQuizActive(active);
  }, []);

  const requestNavigation = useCallback((targetPath: string) => {
    if (isQuizActive && targetPath !== pathname) {
      setPendingNavigation(targetPath);
      setShowWarning(true);
    } else {
      router.push(targetPath);
    }
  }, [isQuizActive, pathname, router]);

  const handleContinueNavigation = () => {
    setShowWarning(false);
    setQuizActive(false);
    if (pendingNavigation) {
      router.push(pendingNavigation);
      setPendingNavigation(null);
    }
  };

  const handleCancelNavigation = () => {
    setShowWarning(false);
    setPendingNavigation(null);
  };

  // Handle browser navigation (back/forward buttons and refresh)
  useEffect(() => {
    if (!isQuizActive) return;

    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      e.preventDefault();
      e.returnValue = 'You will lose your progress in this quiz. Are you sure?';
      return e.returnValue;
    };

    const handlePopState = (e: PopStateEvent) => {
      if (isQuizActive) {
        e.preventDefault();
        // Push current state back to prevent navigation
        window.history.pushState(null, '', window.location.href);
        setPendingNavigation('/pathway');
        setShowWarning(true);
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    window.addEventListener('popstate', handlePopState);

    // Prevent back navigation by pushing current state
    window.history.pushState(null, '', window.location.href);

    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
      window.removeEventListener('popstate', handlePopState);
    };
  }, [isQuizActive]);

  return (
    <NavigationGuardContext.Provider
      value={{
        isQuizActive,
        setQuizActive,
        requestNavigation,
      }}
    >
      {children}
      
      {/* Navigation Warning Dialog */}
      <Dialog
        open={showWarning}
        onClose={handleCancelNavigation}
        maxWidth="sm"
        fullWidth
        PaperProps={{
          sx: {
            backgroundColor: '#4a4a4a',
            borderRadius: 2,
            border: '2px solid #FF6B35',
          }
        }}
      >
        <DialogTitle sx={{ 
          display: 'flex', 
          alignItems: 'center',
          color: '#FF6B35',
          fontWeight: 'bold'
        }}>
          <Warning sx={{ mr: 2, color: '#FF6B35' }} />
          Warning
        </DialogTitle>
        
        <DialogContent sx={{ pt: 2 }}>
          <Typography 
            variant="body1" 
            sx={{ 
              color: '#E0E0E0', 
              lineHeight: 1.6 
            }}
          >
            Please note that leaving means you will lose your progress in this quiz. Are you sure?
          </Typography>
        </DialogContent>

        <DialogActions sx={{ p: 3, gap: 2 }}>
          <Button
            onClick={handleCancelNavigation}
            variant="contained"
            sx={{
              backgroundColor: '#FF6B35',
              '&:hover': {
                backgroundColor: '#e55a2b',
              },
              px: 4,
              flex: 1,
            }}
          >
            Nah, I'm not done yet.
          </Button>
          
          <Button
            onClick={handleContinueNavigation}
            variant="outlined"
            sx={{
              borderColor: '#6B7280',
              color: '#000000',
              backgroundColor: '#D1D5DB',
              '&:hover': {
                backgroundColor: '#9CA3AF',
                borderColor: '#6B7280',
                color: '#000000',
              },
              px: 4,
              flex: 1,
            }}
          >
            Yes. I'm done for now.
          </Button>
        </DialogActions>
      </Dialog>
    </NavigationGuardContext.Provider>
  );
}

export function useNavigationGuard() {
  const context = useContext(NavigationGuardContext);
  if (context === undefined) {
    throw new Error('useNavigationGuard must be used within a NavigationGuardProvider');
  }
  return context;
}