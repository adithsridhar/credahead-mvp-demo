'use client';

import { useEffect, useState } from 'react';
import { Box, Typography, Modal, Fade } from '@mui/material';
import { TrendingUp, Stars, EmojiEvents } from '@mui/icons-material';

interface LevelUpPopupProps {
  open: boolean;
  fromLevel: number;
  toLevel: number;
  onClose: () => void;
}

export default function LevelUpPopup({
  open,
  fromLevel,
  toLevel,
  onClose
}: LevelUpPopupProps) {
  const [showContent, setShowContent] = useState(false);

  useEffect(() => {
    if (open) {
      setShowContent(true);
      const timer = setTimeout(() => {
        setShowContent(false);
        setTimeout(onClose, 300); // Allow fade out animation
      }, 5000);

      return () => clearTimeout(timer);
    }
  }, [open, onClose]);

  return (
    <Modal
      open={open}
      onClose={onClose}
      sx={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 2000,
      }}
    >
      <Fade in={showContent} timeout={300}>
        <Box
          sx={{
            position: 'relative',
            width: { xs: '320px', md: '400px' },
            background: 'linear-gradient(135deg, #FF6B35 0%, #FF8E53 100%)',
            borderRadius: '20px',
            padding: '40px 30px',
            textAlign: 'center',
            boxShadow: '0 20px 40px rgba(255, 107, 53, 0.4)',
            border: '3px solid #FFB366',
            overflow: 'hidden',
          }}
        >
          {/* Background decorations */}
          <Box
            sx={{
              position: 'absolute',
              top: '-50px',
              left: '-50px',
              width: '100px',
              height: '100px',
              borderRadius: '50%',
              backgroundColor: 'rgba(255, 255, 255, 0.1)',
              animation: 'float 6s ease-in-out infinite',
            }}
          />
          <Box
            sx={{
              position: 'absolute',
              bottom: '-30px',
              right: '-30px',
              width: '80px',
              height: '80px',
              borderRadius: '50%',
              backgroundColor: 'rgba(255, 255, 255, 0.1)',
              animation: 'float 8s ease-in-out infinite reverse',
            }}
          />

          {/* Trophy icon */}
          <Box
            sx={{
              display: 'flex',
              justifyContent: 'center',
              mb: 2,
              animation: 'bounce 2s ease-in-out infinite',
            }}
          >
            <EmojiEvents
              sx={{
                fontSize: '4rem',
                color: '#FFD700',
                filter: 'drop-shadow(0 4px 8px rgba(0,0,0,0.3))',
              }}
            />
          </Box>

          {/* Congratulations text */}
          <Typography
            variant="h4"
            sx={{
              color: 'white',
              fontWeight: 'bold',
              mb: 1,
              textShadow: '0 2px 4px rgba(0,0,0,0.3)',
              animation: 'slideInDown 0.8s ease-out',
            }}
          >
            Congratulations!
          </Typography>

          <Typography
            variant="h6"
            sx={{
              color: 'rgba(255, 255, 255, 0.9)',
              mb: 3,
              textShadow: '0 1px 2px rgba(0,0,0,0.3)',
            }}
          >
            You've completed Level {fromLevel}!
          </Typography>

          {/* Level upgrade display */}
          <Box
            sx={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 2,
              mb: 3,
              animation: 'slideInUp 1s ease-out 0.3s both',
            }}
          >
            <Box
              sx={{
                display: 'flex',
                alignItems: 'center',
                backgroundColor: 'rgba(255, 255, 255, 0.2)',
                padding: '12px 16px',
                borderRadius: '12px',
                backdropFilter: 'blur(10px)',
              }}
            >
              <Typography
                variant="h5"
                sx={{
                  color: 'white',
                  fontWeight: 'bold',
                  textShadow: '0 1px 2px rgba(0,0,0,0.3)',
                }}
              >
                Level {fromLevel}
              </Typography>
            </Box>

            <TrendingUp
              sx={{
                fontSize: '2rem',
                color: '#FFD700',
                animation: 'pulse 2s ease-in-out infinite',
              }}
            />

            <Box
              sx={{
                display: 'flex',
                alignItems: 'center',
                backgroundColor: 'rgba(255, 255, 255, 0.3)',
                padding: '12px 16px',
                borderRadius: '12px',
                backdropFilter: 'blur(10px)',
                border: '2px solid rgba(255, 255, 255, 0.4)',
              }}
            >
              <Typography
                variant="h5"
                sx={{
                  color: 'white',
                  fontWeight: 'bold',
                  textShadow: '0 1px 2px rgba(0,0,0,0.3)',
                }}
              >
                Level {toLevel}
              </Typography>
            </Box>
          </Box>

          {/* Stars decoration */}
          <Box
            sx={{
              display: 'flex',
              justifyContent: 'center',
              gap: 1,
              animation: 'slideInUp 1.2s ease-out 0.6s both',
            }}
          >
            {[1, 2, 3].map((star, index) => (
              <Stars
                key={star}
                sx={{
                  fontSize: '1.5rem',
                  color: '#FFD700',
                  animation: `twinkle 2s ease-in-out infinite ${index * 0.3}s`,
                }}
              />
            ))}
          </Box>

          <Typography
            variant="body2"
            sx={{
              color: 'rgba(255, 255, 255, 0.8)',
              mt: 2,
              fontSize: '0.9rem',
            }}
          >
            Your literacy score has been upgraded!
          </Typography>

          {/* Add keyframe animations */}
          <style jsx>{`
            @keyframes bounce {
              0%, 20%, 50%, 80%, 100% { transform: translateY(0); }
              40% { transform: translateY(-10px); }
              60% { transform: translateY(-5px); }
            }
            
            @keyframes float {
              0%, 100% { transform: translateY(0) rotate(0deg); }
              50% { transform: translateY(-20px) rotate(180deg); }
            }
            
            @keyframes slideInDown {
              from { transform: translateY(-30px); opacity: 0; }
              to { transform: translateY(0); opacity: 1; }
            }
            
            @keyframes slideInUp {
              from { transform: translateY(30px); opacity: 0; }
              to { transform: translateY(0); opacity: 1; }
            }
            
            @keyframes pulse {
              0%, 100% { transform: scale(1); }
              50% { transform: scale(1.1); }
            }
            
            @keyframes twinkle {
              0%, 100% { opacity: 1; transform: scale(1); }
              50% { opacity: 0.5; transform: scale(0.8); }
            }
          `}</style>
        </Box>
      </Fade>
    </Modal>
  );
}