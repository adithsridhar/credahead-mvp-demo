'use client';

import { useState, useEffect } from 'react';
import { Dialog, DialogContent, Typography, Button, Box } from '@mui/material';
import { CheckCircle, Cancel } from '@mui/icons-material';

interface FeedbackPopupProps {
  isCorrect: boolean;
  explanation: string;
  continueEnabled: boolean;
  onContinue: () => void;
  open: boolean;
}

export default function FeedbackPopup({ 
  isCorrect, 
  explanation, 
  continueEnabled, 
  onContinue,
  open
}: FeedbackPopupProps) {
  const [countdown, setCountdown] = useState(10);
  
  useEffect(() => {
    if (open && !continueEnabled && countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [countdown, continueEnabled, open]);

  useEffect(() => {
    if (open) {
      setCountdown(10);
    }
  }, [open]);
  
  return (
    <Dialog
      open={open}
      maxWidth="sm"
      fullWidth
      PaperProps={{
        sx: {
          backgroundColor: '#4a4a4a',
          border: '2px solid #FF6B35',
          borderRadius: 2,
        }
      }}
    >
      <DialogContent sx={{ textAlign: 'center', p: 4 }}>
        <Box sx={{ display: 'flex', justifyContent: 'center', mb: 2 }}>
          {isCorrect ? (
            <CheckCircle sx={{ fontSize: 60, color: '#4CAF50' }} />
          ) : (
            <Cancel sx={{ fontSize: 60, color: '#f44336' }} />
          )}
        </Box>

        <Typography variant="h5" component="h2" sx={{ mb: 2, color: '#FF6B35', fontWeight: 'bold' }}>
          {isCorrect ? 'That is correct!' : 'Sorry that is incorrect.'}
        </Typography>
        
        <Typography variant="body1" sx={{ mb: 4, lineHeight: 1.6, color: '#E0E0E0' }}>
          {explanation}
        </Typography>
        
        <Button
          variant="contained"
          onClick={onContinue}
          disabled={!continueEnabled}
          sx={{
            backgroundColor: '#FF6B35',
            '&:hover': {
              backgroundColor: '#e55a2b',
            },
            '&:disabled': {
              backgroundColor: '#666',
              color: '#999',
            },
            px: 4,
            py: 1.5,
            fontSize: '1rem',
          }}
        >
          {continueEnabled ? 'Continue' : `Continue (${countdown})`}
        </Button>
      </DialogContent>
    </Dialog>
  );
}