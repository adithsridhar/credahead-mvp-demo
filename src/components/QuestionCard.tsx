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
    <Card sx={{ maxWidth: 800, margin: '0 auto', mb: 3 }}>
      <CardContent sx={{ p: 4 }}>
        <Typography variant="h6" component="h2" gutterBottom sx={{ mb: 3 }}>
          {question.text}
        </Typography>

        <FormControl component="fieldset" sx={{ width: '100%', mb: 3 }}>
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
                  mb: 1,
                  '& .MuiFormControlLabel-label': {
                    fontSize: '1rem',
                    lineHeight: 1.5,
                  },
                }}
              />
            ))}
          </RadioGroup>
        </FormControl>

        <Box sx={{ display: 'flex', justifyContent: 'flex-end' }}>
          <Button
            variant="contained"
            onClick={handleSubmit}
            disabled={selectedOption === null || disabled}
            sx={{
              backgroundColor: '#FF6B35',
              '&:hover': {
                backgroundColor: '#e55a2b',
              },
              px: 4,
              py: 1.5,
            }}
          >
            Submit Answer
          </Button>
        </Box>
      </CardContent>
    </Card>
  );
}