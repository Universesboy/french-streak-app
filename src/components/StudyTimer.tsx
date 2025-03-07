import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Button,
  Paper,
  Card,
  CardContent,
  Grid,
  CircularProgress,
  styled,
  useTheme,
  useMediaQuery,
  Fab,
  Zoom,
  Divider
} from '@mui/material';
import {
  PlayArrow as PlayIcon,
  Stop as StopIcon,
  Timer as TimerIcon,
  BarChart as ChartIcon,
  AccessTime as ClockIcon
} from '@mui/icons-material';
import { formatTime } from '../utils/streakUtils';
import type { StreakData } from '../utils/streakUtils';
import { differenceInSeconds } from 'date-fns';
import PlayArrowIcon from '@mui/icons-material/PlayArrow';

interface StudyTimerProps {
  onStart: () => void;
  onStop: () => void;
  isRunning: boolean;
  startTime: Date | null;
}

interface StyledComponentProps {
  isMobile: boolean;
}

const CircularProgressWrapper = styled(Box)<{ isMobile: boolean }>(({ theme, isMobile }) => ({
  position: 'relative',
  width: isMobile ? 200 : 240,
  height: isMobile ? 200 : 240,
  margin: '0 auto',
  transition: 'all 0.3s ease',
}));

const TimerDisplay = styled(Typography)<{ isMobile: boolean }>(({ theme, isMobile }) => ({
  position: 'absolute',
  top: '50%',
  left: '50%',
  transform: 'translate(-50%, -50%)',
  fontSize: isMobile ? '2rem' : '2.5rem',
  fontWeight: 'bold',
  letterSpacing: 2,
  fontFamily: 'monospace',
  transition: 'all 0.3s ease',
}));

const ControlButton = styled(Button)(({ theme }) => ({
  padding: '12px 24px',
  borderRadius: 50,
  margin: theme.spacing(1),
  minWidth: 120,
  fontSize: '1rem',
  boxShadow: '0 4px 10px rgba(0, 0, 0, 0.1)',
  transition: 'transform 0.2s, box-shadow 0.2s',
  '&:hover': {
    transform: 'translateY(-2px)',
    boxShadow: '0 6px 12px rgba(0, 0, 0, 0.15)',
  },
}));

const ControlFab = styled(Fab)(({ theme }) => ({
  boxShadow: '0 4px 10px rgba(0, 0, 0, 0.15)',
  '&:active': {
    boxShadow: '0 2px 5px rgba(0, 0, 0, 0.15)',
  },
}));

const StatCard = styled(Card)(({ theme }) => ({
  height: '100%',
  boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
  transition: 'transform 0.2s, box-shadow 0.2s',
  '&:hover': {
    transform: 'translateY(-4px)',
    boxShadow: '0 6px 12px rgba(0,0,0,0.12)',
  },
}));

const StudyTimer: React.FC<StudyTimerProps> = ({ 
  onStart, 
  onStop, 
  isRunning, 
  startTime 
}) => {
  const theme = useTheme();
  const [elapsedTime, setElapsedTime] = useState(0);
  
  // Update elapsed time every second when timer is running
  useEffect(() => {
    if (!isRunning || !startTime) {
      return;
    }
    
    const intervalId = setInterval(() => {
      const now = new Date();
      const secondsElapsed = differenceInSeconds(now, startTime);
      setElapsedTime(secondsElapsed);
    }, 1000);
    
    return () => clearInterval(intervalId);
  }, [isRunning, startTime]);
  
  // Format time as HH:MM:SS
  const formatTime = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    
    return [
      hours.toString().padStart(2, '0'),
      minutes.toString().padStart(2, '0'),
      secs.toString().padStart(2, '0')
    ].join(':');
  };
  
  // Calculate progress percentage for circular progress (max 2 hours = 7200 seconds)
  const calculateProgress = () => {
    const maxTime = 7200; // 2 hours
    const progress = (elapsedTime / maxTime) * 100;
    return Math.min(progress, 100);
  };
  
  return (
    <Paper 
      elevation={2} 
      sx={{ 
        p: 3, 
        borderRadius: 3,
        backgroundColor: theme.palette.background.paper
      }}
    >
      <Typography 
        variant="h5" 
        component="h2" 
        gutterBottom 
        sx={{ 
          fontWeight: 'bold',
          textAlign: 'center',
          mb: 3,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center'
        }}
      >
        <TimerIcon sx={{ mr: 1, color: theme.palette.primary.main }} />
        Study Timer
      </Typography>
      
      <Grid container spacing={3}>
        <Grid item xs={12} md={6}>
          <Box 
            sx={{ 
              display: 'flex', 
              flexDirection: 'column', 
              alignItems: 'center',
              justifyContent: 'center',
              position: 'relative',
              mb: { xs: 2, md: 0 }
            }}
          >
            <Box 
              sx={{ 
                position: 'relative', 
                display: 'inline-flex',
                mb: 2
              }}
            >
              <CircularProgress
                variant="determinate"
                value={calculateProgress()}
                size={200}
                thickness={4}
                sx={{
                  color: isRunning ? theme.palette.secondary.main : theme.palette.primary.main,
                  '& .MuiCircularProgress-circle': {
                    strokeLinecap: 'round',
                  },
                }}
              />
              <Box
                sx={{
                  top: 0,
                  left: 0,
                  bottom: 0,
                  right: 0,
                  position: 'absolute',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <Typography
                  variant="h3"
                  component="div"
                  sx={{ fontWeight: 'bold' }}
                >
                  {formatTime(elapsedTime)}
                </Typography>
              </Box>
            </Box>
            
            <Button
              variant="contained"
              color={isRunning ? "error" : "primary"}
              size="large"
              startIcon={isRunning ? <StopIcon /> : <PlayArrowIcon />}
              onClick={isRunning ? onStop : onStart}
              sx={{ 
                px: 4, 
                py: 1.5,
                borderRadius: 2,
                fontWeight: 'bold',
                fontSize: '1rem',
              }}
            >
              {isRunning ? 'Stop Timer' : 'Start Timer'}
            </Button>
          </Box>
        </Grid>
        
        <Grid item xs={12} md={6}>
          <Box sx={{ height: '100%' }}>
            <Typography variant="h6" gutterBottom>
              Timer Instructions
            </Typography>
            
            <Divider sx={{ mb: 2 }} />
            
            <Typography variant="body1" paragraph>
              Use this timer to track your French study sessions. Your study time will be recorded and added to your statistics.
            </Typography>
            
            <Typography variant="body2" sx={{ mb: 2 }}>
              <strong>How to use:</strong>
            </Typography>
            
            <Box component="ol" sx={{ pl: 2 }}>
              <Box component="li" sx={{ mb: 1 }}>
                <Typography variant="body2">
                  Click "Start Timer" when you begin studying
                </Typography>
              </Box>
              <Box component="li" sx={{ mb: 1 }}>
                <Typography variant="body2">
                  The timer will continue running even if you close the app
                </Typography>
              </Box>
              <Box component="li">
                <Typography variant="body2">
                  Click "Stop Timer" when you finish your study session
                </Typography>
              </Box>
            </Box>
          </Box>
        </Grid>
      </Grid>
    </Paper>
  );
};

export default StudyTimer;