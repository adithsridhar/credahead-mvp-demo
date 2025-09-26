'use client';

import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import {
  Container,
  Typography,
  Box,
  Card,
  CardContent,
  Button,
  TextField,
  Alert,
  CircularProgress,
  Grid,
  Chip,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Tabs,
  Tab,
} from '@mui/material';
import { CloudUpload, Assessment, School, QuestionMark } from '@mui/icons-material';
import { supabase } from '@/lib/supabase';

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

function TabPanel({ children, value, index }: TabPanelProps) {
  return (
    <div hidden={value !== index}>
      {value === index && <Box sx={{ p: 3 }}>{children}</Box>}
    </div>
  );
}

export default function AdminDashboard() {
  const [tabValue, setTabValue] = useState(0);
  const [uploadType, setUploadType] = useState<'lessons' | 'questions'>('lessons');
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [uploadResult, setUploadResult] = useState<{
    success: boolean;
    message: string;
    imported?: number;
  } | null>(null);

  // Fetch dashboard stats
  const { data: stats, isLoading: statsLoading } = useQuery({
    queryKey: ['admin-stats'],
    queryFn: async () => {
      try {
        const response = await fetch('/api/admin/stats');
        if (!response.ok) {
          throw new Error('Failed to fetch admin stats');
        }
        const data = await response.json();
        console.log('Admin dashboard received:', data);
        return data;
      } catch (error) {
        console.error('Admin stats error:', error);
        return {
          totalLessons: 0,
          totalQuestions: 0,
          totalUsers: 0,
          totalSessions: 0,
          lessons: [],
          allUsers: [],
        };
      }
    },
    refetchInterval: 30000, // Refetch every 30 seconds
    retry: 1,
  });

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = event.target.files?.[0];
    setFile(selectedFile || null);
    setUploadResult(null);
  };

  const handleUpload = async () => {
    if (!file) {
      setUploadResult({ success: false, message: 'Please select a file' });
      return;
    }

    try {
      setUploading(true);
      setUploadResult(null);

      const formData = new FormData();
      formData.append('file', file);
      formData.append('type', uploadType);

      const response = await fetch('/api/admin/import', {
        method: 'POST',
        body: formData,
      });

      const result = await response.json();

      if (result.success) {
        setUploadResult({
          success: true,
          message: `Successfully imported ${result.imported} ${uploadType}`,
          imported: result.imported,
        });
        // Refresh stats
        window.location.reload();
      } else {
        setUploadResult({
          success: false,
          message: result.error || 'Upload failed',
        });
      }
    } catch (error: any) {
      setUploadResult({
        success: false,
        message: error.message || 'Upload failed',
      });
    } finally {
      setUploading(false);
    }
  };

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };

  return (
    <Container maxWidth="xl" sx={{ py: 4 }}>
      <Typography variant="h3" component="h1" gutterBottom sx={{ 
        color: '#FF6B35', 
        fontWeight: 'bold',
        mb: 4
      }}>
        Admin Dashboard
      </Typography>

      <Tabs value={tabValue} onChange={handleTabChange} sx={{ mb: 3 }}>
        <Tab label="Overview" />
        <Tab label="Data Import" />
        <Tab label="Content Management" />
      </Tabs>

      {/* Overview Tab */}
      <TabPanel value={tabValue} index={0}>
        {statsLoading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
            <CircularProgress size={60} sx={{ color: '#FF6B35' }} />
          </Box>
        ) : (
          <Grid container spacing={3}>
            {/* Stats Cards */}
            <Grid item xs={12} sm={6} md={3}>
              <Card sx={{ backgroundColor: '#4a4a4a' }}>
                <CardContent sx={{ textAlign: 'center' }}>
                  <School sx={{ fontSize: 40, color: '#FF6B35', mb: 1 }} />
                  <Typography variant="h4" sx={{ color: '#FF6B35', fontWeight: 'bold' }}>
                    {stats?.totalLessons || 0}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Total Lessons
                  </Typography>
                </CardContent>
              </Card>
            </Grid>

            <Grid item xs={12} sm={6} md={3}>
              <Card sx={{ backgroundColor: '#4a4a4a' }}>
                <CardContent sx={{ textAlign: 'center' }}>
                  <QuestionMark sx={{ fontSize: 40, color: '#4CAF50', mb: 1 }} />
                  <Typography variant="h4" sx={{ color: '#4CAF50', fontWeight: 'bold' }}>
                    {stats?.totalQuestions || 0}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Total Questions
                  </Typography>
                </CardContent>
              </Card>
            </Grid>

            <Grid item xs={12} sm={6} md={3}>
              <Card sx={{ backgroundColor: '#4a4a4a' }}>
                <CardContent sx={{ textAlign: 'center' }}>
                  <Assessment sx={{ fontSize: 40, color: '#2196F3', mb: 1 }} />
                  <Typography variant="h4" sx={{ color: '#2196F3', fontWeight: 'bold' }}>
                    {stats?.totalUsers || 0}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Total Users
                  </Typography>
                </CardContent>
              </Card>
            </Grid>

            <Grid item xs={12} sm={6} md={3}>
              <Card sx={{ backgroundColor: '#4a4a4a' }}>
                <CardContent sx={{ textAlign: 'center' }}>
                  <CloudUpload sx={{ fontSize: 40, color: '#9C27B0', mb: 1 }} />
                  <Typography variant="h4" sx={{ color: '#9C27B0', fontWeight: 'bold' }}>
                    {stats?.totalSessions || 0}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Quiz Sessions
                  </Typography>
                </CardContent>
              </Card>
            </Grid>

            {/* User Data */}
            <Grid item xs={12} md={6}>
              <Card sx={{ backgroundColor: '#4a4a4a' }}>
                <CardContent>
                  <Typography variant="h6" gutterBottom sx={{ color: '#FF6B35' }}>
                    User Data
                  </Typography>
                  <TableContainer sx={{ maxHeight: 400 }}>
                    <Table size="small" stickyHeader>
                      <TableHead>
                        <TableRow>
                          <TableCell>Email</TableCell>
                          <TableCell>Name</TableCell>
                          <TableCell>Current Level</TableCell>
                          <TableCell>Assessment</TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {stats?.allUsers.map((user) => (
                          <TableRow key={user.id}>
                            <TableCell>{user.email}</TableCell>
                            <TableCell>{user.name}</TableCell>
                            <TableCell>
                              <Chip 
                                label={`Level ${user.literacy_level}`} 
                                size="small" 
                                sx={{ backgroundColor: '#FF6B35', color: 'white' }}
                              />
                            </TableCell>
                            <TableCell>
                              <Chip 
                                label={user.assessment_taken ? `Score: ${user.literacy_level}` : 'Pending'} 
                                size="small"
                                color={user.assessment_taken ? 'success' : 'warning'}
                              />
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </TableContainer>
                </CardContent>
              </Card>
            </Grid>

            {/* Lessons by Module */}
            <Grid item xs={12} md={3}>
              <Card sx={{ backgroundColor: '#4a4a4a' }}>
                <CardContent>
                  <Typography variant="h6" gutterBottom sx={{ color: '#FF6B35' }}>
                    Lessons by Module
                  </Typography>
                  {stats?.modules && stats.modules.length > 0 ? (
                    stats.modules.map((module: any) => {
                      const count = stats?.lessons.filter(l => l.module_id === module.module_id).length || 0;
                      return (
                        <Box key={module.module_id} sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                          <Typography sx={{ fontSize: '0.875rem' }}>{module.name}</Typography>
                          <Box
                            sx={{
                              backgroundColor: '#4CAF50',
                              color: 'white',
                              px: 1.5,
                              py: 0.5,
                              borderRadius: 1,
                              fontSize: '0.875rem',
                              fontWeight: 'bold',
                              minWidth: '24px',
                              textAlign: 'center'
                            }}
                          >
                            {count}
                          </Box>
                        </Box>
                      );
                    })
                  ) : (
                    <Typography sx={{ color: '#E0E0E0', fontStyle: 'italic' }}>
                      No modules found
                    </Typography>
                  )}
                </CardContent>
              </Card>
            </Grid>

            {/* Lessons by Level */}
            <Grid item xs={12} md={3}>
              <Card sx={{ backgroundColor: '#4a4a4a' }}>
                <CardContent>
                  <Typography variant="h6" gutterBottom sx={{ color: '#FF6B35' }}>
                    Lessons by Level
                  </Typography>
                  {Array.from({ length: 10 }, (_, i) => i + 1).map(level => {
                    const count = stats?.lessons.filter(l => l.level === level).length || 0;
                    return (
                      <Box key={level} sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                        <Typography>Level {level}</Typography>
                        <Box
                          sx={{
                            backgroundColor: '#FF6B35',
                            color: 'white',
                            px: 1.5,
                            py: 0.5,
                            borderRadius: 1,
                            fontSize: '0.875rem',
                            fontWeight: 'bold',
                            minWidth: '24px',
                            textAlign: 'center'
                          }}
                        >
                          {count}
                        </Box>
                      </Box>
                    );
                  })}
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        )}
      </TabPanel>

      {/* Data Import Tab */}
      <TabPanel value={tabValue} index={1}>
        <Grid container spacing={3}>
          <Grid item xs={12} md={8}>
            <Card sx={{ backgroundColor: '#4a4a4a' }}>
              <CardContent>
                <Typography variant="h5" gutterBottom sx={{ color: '#FF6B35' }}>
                  CSV Data Import
                </Typography>
                
                <Box sx={{ mb: 3 }}>
                  <Typography variant="subtitle1" gutterBottom>
                    Import Type
                  </Typography>
                  <Box sx={{ display: 'flex', gap: 2 }}>
                    <Button
                      variant={uploadType === 'lessons' ? 'contained' : 'outlined'}
                      onClick={() => setUploadType('lessons')}
                      sx={{ 
                        backgroundColor: uploadType === 'lessons' ? '#FF6B35' : 'transparent',
                        borderColor: '#FF6B35',
                        color: uploadType === 'lessons' ? 'white' : '#FF6B35'
                      }}
                    >
                      Lessons
                    </Button>
                    <Button
                      variant={uploadType === 'questions' ? 'contained' : 'outlined'}
                      onClick={() => setUploadType('questions')}
                      sx={{ 
                        backgroundColor: uploadType === 'questions' ? '#FF6B35' : 'transparent',
                        borderColor: '#FF6B35',
                        color: uploadType === 'questions' ? 'white' : '#FF6B35'
                      }}
                    >
                      Questions
                    </Button>
                  </Box>
                </Box>

                <Box sx={{ mb: 3 }}>
                  <input
                    type="file"
                    accept=".csv"
                    onChange={handleFileChange}
                    style={{ display: 'none' }}
                    id="csv-upload"
                  />
                  <label htmlFor="csv-upload">
                    <Button
                      variant="outlined"
                      component="span"
                      startIcon={<CloudUpload />}
                      sx={{ borderColor: '#FF6B35', color: '#FF6B35' }}
                    >
                      Choose CSV File
                    </Button>
                  </label>
                  {file && (
                    <Typography variant="body2" sx={{ mt: 1, color: '#E0E0E0' }}>
                      Selected: {file.name}
                    </Typography>
                  )}
                </Box>

                <Button
                  variant="contained"
                  onClick={handleUpload}
                  disabled={!file || uploading}
                  sx={{ 
                    backgroundColor: '#FF6B35',
                    '&:hover': { backgroundColor: '#e55a2b' }
                  }}
                >
                  {uploading ? <CircularProgress size={24} /> : `Upload ${uploadType}`}
                </Button>

                {uploadResult && (
                  <Alert 
                    severity={uploadResult.success ? 'success' : 'error'} 
                    sx={{ mt: 2 }}
                  >
                    {uploadResult.message}
                  </Alert>
                )}
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} md={4}>
            <Card sx={{ backgroundColor: '#4a4a4a' }}>
              <CardContent>
                <Typography variant="h6" gutterBottom sx={{ color: '#FF6B35' }}>
                  CSV Format Guide
                </Typography>
                
                <Typography variant="subtitle2" sx={{ mt: 2, mb: 1 }}>
                  Lessons CSV Headers:
                </Typography>
                <Typography variant="body2" sx={{ fontFamily: 'monospace', fontSize: '0.8rem' }}>
                  lesson_id, title, description, level, estimated_duration, prerequisites
                </Typography>

                <Typography variant="subtitle2" sx={{ mt: 2, mb: 1 }}>
                  Questions CSV Headers:
                </Typography>
                <Typography variant="body2" sx={{ fontFamily: 'monospace', fontSize: '0.8rem' }}>
                  question_id, lesson_id, text, options, correct_answer, difficulty, explanation
                </Typography>

                <Alert severity="info" sx={{ mt: 2 }}>
                  Options should be JSON array format: ["Option 1", "Option 2", "Option 3", "Option 4"]
                </Alert>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      </TabPanel>

      {/* Content Management Tab */}
      <TabPanel value={tabValue} index={2}>
        <Typography variant="h5" gutterBottom sx={{ color: '#FF6B35' }}>
          Content Management
        </Typography>
        <Typography variant="body1" sx={{ color: '#E0E0E0' }}>
          Content management features will be implemented in future versions.
          This will include editing lessons, questions, and user management.
        </Typography>
      </TabPanel>
    </Container>
  );
}