'use client';

import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import { Card, CardContent, Typography, Box, Container, Grid } from '@mui/material';
import { 
  Newspaper, 
  LibraryBooks, 
  TrendingUp, 
  Psychology 
} from '@mui/icons-material';

const featureCards = [
  {
    title: 'News Feed',
    icon: <Newspaper sx={{ fontSize: 48, color: '#FF6B35' }} />,
    description: 'Stay updated with latest financial news and trends',
    route: '/news-feed',
    comingSoon: true
  },
  {
    title: 'Reading Library',
    icon: <LibraryBooks sx={{ fontSize: 48, color: '#FF6B35' }} />,
    description: 'Deep dive into financial topics',
    route: '/reading-library',
    comingSoon: true
  },
  {
    title: 'Learning Pathway',
    icon: <TrendingUp sx={{ fontSize: 48, color: '#FF6B35' }} />,
    description: 'Boost your literacy score with quizzes',
    route: '/pathway-coming-soon',
    comingSoon: true
  },
  {
    title: 'Socratic Corner',
    icon: <Psychology sx={{ fontSize: 48, color: '#FF6B35' }} />,
    description: 'Master topics through guided learning',
    route: '/socratic-corner',
    comingSoon: true
  }
];

export default function DashboardPage() {
  const { user, appUser } = useAuth();
  const router = useRouter();

  // Redirect if not authenticated or assessment not completed
  if (!user || !appUser || !appUser.assessment_taken) {
    router.push('/');
    return null;
  }

  const handleCardClick = (route: string, comingSoon: boolean) => {
    if (comingSoon) {
      // For coming soon features, navigate to placeholder pages
      router.push(route);
    } else {
      // For active features, navigate normally
      router.push(route);
    }
  };

  return (
    <Container maxWidth="lg" sx={{ py: 4, minHeight: '100vh' }}>
      {/* Header Section */}
      <Box sx={{ textAlign: 'center', mb: 6 }}>
        <Typography 
          variant="h3" 
          sx={{ 
            color: 'white', 
            fontWeight: 'bold',
            mb: 2,
            fontSize: { xs: '1.75rem', sm: '2.25rem', md: '3rem' }
          }}
        >
          Welcome, {appUser.name}
        </Typography>
        <Typography 
          variant="h5" 
          sx={{ 
            color: '#FF6B35',
            fontWeight: 'semibold',
            fontSize: { xs: '1.125rem', sm: '1.5rem', md: '1.875rem' }
          }}
        >
          Literacy Level: {appUser.literacy_level}/10
        </Typography>
      </Box>

      {/* Feature Cards Grid */}
      <Grid container spacing={4} sx={{ mb: 4 }}>
        {featureCards.map((feature, index) => (
          <Grid item xs={6} md={6} key={index}>
            <Card
              onClick={() => handleCardClick(feature.route, feature.comingSoon)}
              sx={{
                backgroundColor: '#2a2a2a',
                borderRadius: 3,
                cursor: 'pointer',
                transition: 'all 0.3s ease',
                border: '2px solid transparent',
                height: { xs: '200px', sm: '250px', md: '280px' },
                display: 'flex',
                flexDirection: 'column',
                '&:hover': {
                  backgroundColor: '#3a3a3a',
                  borderColor: '#FF6B35',
                  transform: 'translateY(-4px)',
                  boxShadow: '0 8px 25px rgba(255, 107, 53, 0.3)'
                }
              }}
            >
              <CardContent 
                sx={{ 
                  p: { xs: 2, sm: 3, md: 4 },
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center',
                  textAlign: 'center',
                  height: '100%',
                  position: 'relative'
                }}
              >
                {/* Coming Soon Badge */}
                {feature.comingSoon && (
                  <Box
                    sx={{
                      position: 'absolute',
                      top: 8,
                      right: 8,
                      backgroundColor: '#FF6B35',
                      color: 'white',
                      px: 1,
                      py: 0.5,
                      borderRadius: 1,
                      fontSize: '0.75rem',
                      fontWeight: 'bold'
                    }}
                  >
                    Coming Soon
                  </Box>
                )}

                {/* Icon */}
                <Box sx={{ mb: 2 }}>
                  {feature.icon}
                </Box>

                {/* Title */}
                <Typography 
                  variant="h6" 
                  sx={{ 
                    color: 'white',
                    fontWeight: 'bold',
                    mb: 1,
                    fontSize: { xs: '1rem', sm: '1.125rem', md: '1.25rem' }
                  }}
                >
                  {feature.title}
                </Typography>

                {/* Description */}
                <Typography 
                  variant="body2" 
                  sx={{ 
                    color: '#E0E0E0',
                    lineHeight: 1.4,
                    fontSize: { xs: '0.8rem', sm: '0.875rem', md: '0.9rem' }
                  }}
                >
                  {feature.description}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      {/* Quick Stats or Additional Info */}
      <Box sx={{ textAlign: 'center', mt: 6 }}>
        <Typography 
          variant="body1" 
          sx={{ 
            color: '#B0B0B0',
            fontSize: { xs: '0.875rem', sm: '1rem' }
          }}
        >
          Continue your financial literacy journey by exploring the features above
        </Typography>
      </Box>
    </Container>
  );
}