'use client';

import { useState } from 'react';
import { Card, CardContent, Typography, Button, Box, Radio, RadioGroup, FormControlLabel, FormControl } from '@mui/material';
import type { Question } from '@/lib/supabase';

interface QuestionCardProps {
  question: Question;
  onAnswer: (selectedOption: number, question: Question) => void;
  disabled?: boolean;
}

export default function QuestionCard({ question, onAnswer, disabled = false }: QuestionCardProps) {
  const [selectedOption, setSelectedOption] = useState<number | null>(null);

  const handleSubmit = () => {
    if (selectedOption !== null) {
      onAnswer(selectedOption, question);
    }
  };

  const options = Array.isArray(question.options) ? question.options : [];

  return (
    <Card sx={{ 
      maxWidth: 800, 
      margin: '0 auto', 
      mb: { xs: 2, sm: 3, md: 4 },
      height: 'fit-content',
      display: 'flex',
      flexDirection: 'column',
      borderRadius: { xs: 2, md: 3 },
      boxShadow: { md: '0 8px 24px rgba(0,0,0,0.15)' }
    }}>
      <CardContent sx={{ 
        p: { xs: 3, sm: 4, md: 5 },
        flexGrow: 1,
        display: 'flex',
        flexDirection: 'column'
      }}>
        <Typography variant="h6" component="h2" gutterBottom sx={{ 
          mb: { xs: 3, sm: 4, md: 5 },
          fontSize: { xs: '1.125rem', sm: '1.25rem', md: '1.5rem' },
          lineHeight: 1.3,
          fontWeight: 600
        }}>
          {question.text}
        </Typography>

        <FormControl component="fieldset" sx={{ 
          width: '100%', 
          mb: { xs: 3, sm: 4, md: 5 },
          flexGrow: 1
        }}>
          <RadioGroup
            value={selectedOption}
            onChange={(e) => setSelectedOption(Number(e.target.value))}
          >
            {options.map((option: string, index: number) => (
              <FormControlLabel
                key={index}
                value={index}
                control={<Radio />}
                label={option}
                disabled={disabled}
                sx={{
                  mb: { xs: 1, sm: 1.5, md: 2 },
                  p: { xs: 1.5, sm: 2, md: 2.5 },
                  borderRadius: { xs: 2, md: 3 },
                  backgroundColor: { md: 'rgba(255,255,255,0.02)' },
                  transition: 'all 0.2s ease',
                  '&:hover': {
                    backgroundColor: { md: 'rgba(255,255,255,0.05)' },
                    transform: { md: 'translateX(4px)' }
                  },
                  '& .MuiFormControlLabel-label': {
                    fontSize: { xs: '0.875rem', sm: '0.9375rem', md: '1rem' },
                    lineHeight: 1.5,
                  },
                  '& .MuiRadio-root': {
                    padding: { xs: '8px', sm: '9px', md: '12px' },
                    '& .MuiSvgIcon-root': {
                      fontSize: { xs: '1.2rem', md: '1.5rem' }
                    }
                  }
                }}
              />
            ))}
          </RadioGroup>
        </FormControl>

        <Box sx={{ 
          display: 'flex', 
          justifyContent: { xs: 'center', sm: 'flex-end' },
          mt: 'auto'
        }}>
          <Button
            variant="contained"
            onClick={handleSubmit}
            disabled={selectedOption === null || disabled}
            sx={{
              backgroundColor: '#FF6B35',
              borderRadius: { xs: '8px', md: '12px' },
              height: { xs: '48px', sm: '52px', md: '56px' },
              px: { xs: 4, sm: 5, md: 6 },
              fontSize: { xs: '0.875rem', sm: '0.9375rem', md: '1rem' },
              fontWeight: 600,
              textTransform: 'none',
              minWidth: { xs: '160px', sm: '180px', md: '200px' },
              transition: 'all 0.2s ease',
              '&:hover': {
                backgroundColor: '#e55a2b',
                transform: { md: 'translateY(-2px)' },
                boxShadow: { md: '0 8px 24px rgba(255,107,53,0.3)' }
              },
            }}
          >
            Submit Answer
          </Button>
        </Box>
      </CardContent>
    </Card>
  );
}