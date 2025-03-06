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
  Zoom
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

interface StudyTimerProps {
  streakData: StreakData;
  onTimerStart: () => void;
  onTimerStop: () => void;
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
  streakData, 
  onTimerStart, 
  onTimerStop 
}) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const [seconds, setSeconds] = useState(0);
  const [isRunning, setIsRunning] = useState(false);
  
  // Initialize timer based on ongoing session if exists
  useEffect(() => {
    if (streakData.ongoingSession) {
      setIsRunning(true);
      const startTime = new Date(streakData.ongoingSession.startTime);
      const elapsedSeconds = Math.floor((new Date().getTime() - startTime.getTime()) / 1000);
      setSeconds(elapsedSeconds);
    } else {
      setIsRunning(false);
      setSeconds(0);
    }
  }, [streakData.ongoingSession]);
  
  // Timer tick effect
  useEffect(() => {
    let interval: number | undefined = undefined;
    
    if (isRunning) {
      interval = window.setInterval(() => {
        setSeconds(prev => prev + 1);
      }, 1000);
    }
    
    return () => {
      if (interval !== undefined) {
        window.clearInterval(interval);
      }
    };
  }, [isRunning]);
  
  // Handle start button click
  const handleStart = () => {
    setIsRunning(true);
    onTimerStart();
  };
  
  // Handle stop button click
  const handleStop = () => {
    setIsRunning(false);
    onTimerStop();
  };
  
  // Calculate progress percentage for circular progress (cycles every hour)
  const progressPercentage = (seconds % 3600) / 3600 * 100;
  
  // Get time summaries from streak data
  const summaries = streakData.studySessions.length > 0 ? {
    todayTime: streakData.studySessions
      .filter(session => session.date === new Date().toISOString().split('T')[0])
      .reduce((total, session) => total + session.duration, 0),
    totalTime: streakData.studySessions
      .reduce((total, session) => total + session.duration, 0)
  } : { todayTime: 0, totalTime: 0 };
  
  // Format hours and minutes from seconds
  const formatHoursMinutes = (totalSeconds: number) => {
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    
    if (hours > 0) {
      return `${hours}h ${minutes}m`;
    } else {
      return `${minutes}m`;
    }
  };
  
  return (
    <Box sx={{ mt: 4 }}>
      <Typography variant="h5" component="h2" sx={{ 
        display: 'flex', 
        alignItems: 'center', 
        mb: 3,
        fontWeight: 'bold'
      }}>
        <TimerIcon sx={{ mr: 1, color: theme.palette.primary.main }} />
        Study Timer
      </Typography>
      
      <Paper 
        elevation={0} 
        sx={{ 
          p: isMobile ? 2 : 4, 
          borderRadius: 4,
          boxShadow: '0 4px 20px rgba(0, 0, 0, 0.08)',
          backgroundColor: '#fff',
          mb: 4
        }}
      >
        <CircularProgressWrapper isMobile={isMobile}>
          <CircularProgress
            variant="determinate"
            value={progressPercentage}
            size={isMobile ? 200 : 240}
            thickness={4}
            sx={{ 
              color: isRunning ? theme.palette.success.main : theme.palette.primary.main,
              transition: 'color 0.3s ease'
            }}
          />
          <TimerDisplay variant="h2" isMobile={isMobile}>
            {formatTime(seconds)}
          </TimerDisplay>
        </CircularProgressWrapper>
        
        <Box sx={{ 
          display: 'flex', 
          justifyContent: 'center', 
          mt: 4,
          flexWrap: 'wrap'
        }}>
          {isMobile ? (
            // Mobile controls - Floating Action Button
            <Zoom in={true}>
              {isRunning ? (
                <ControlFab
                  color="error"
                  size="large"
                  onClick={handleStop}
                  sx={{ width: 80, height: 80 }}
                >
                  <StopIcon sx={{ fontSize: 40 }} />
                </ControlFab>
              ) : (
                <ControlFab
                  color="success"
                  size="large"
                  onClick={handleStart}
                  sx={{ width: 80, height: 80 }}
                >
                  <PlayIcon sx={{ fontSize: 40 }} />
                </ControlFab>
              )}
            </Zoom>
          ) : (
            // Desktop controls - Regular buttons
            isRunning ? (
              <ControlButton
                variant="contained"
                color="error"
                startIcon={<StopIcon />}
                onClick={handleStop}
                size="large"
              >
                Stop
              </ControlButton>
            ) : (
              <ControlButton
                variant="contained"
                color="success"
                startIcon={<PlayIcon />}
                onClick={handleStart}
                size="large"
              >
                Start
              </ControlButton>
            )
          )}
        </Box>
        
        <Typography 
          variant="body2" 
          color="text.secondary" 
          sx={{ 
            textAlign: 'center', 
            mt: 2,
            fontSize: isMobile ? '0.8rem' : '0.875rem'
          }}
        >
          {isRunning 
            ? "Your study session is being tracked. Click 'Stop' when you finish."
            : "Click 'Start' to begin tracking your study time."
          }
        </Typography>
      </Paper>
      
      <Typography variant="h6" sx={{ mt: 4, mb: 2, display: 'flex', alignItems: 'center' }}>
        <ChartIcon sx={{ mr: 1, color: theme.palette.secondary.main }} />
        Quick Study Summary
      </Typography>
      
      <Grid container spacing={isMobile ? 2 : 3}>
        <Grid item xs={12} sm={6}>
          <StatCard>
            <CardContent sx={{ textAlign: 'center', py: isMobile ? 2 : 3 }}>
              <ClockIcon sx={{ fontSize: isMobile ? 30 : 40, color: theme.palette.primary.main, mb: 1 }} />
              <Typography variant={isMobile ? "h6" : "h5"} component="div" sx={{ fontWeight: 'bold' }}>
                {formatHoursMinutes(summaries.todayTime + (isRunning ? seconds : 0))}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Time Studied Today
              </Typography>
            </CardContent>
          </StatCard>
        </Grid>
        
        <Grid item xs={12} sm={6}>
          <StatCard>
            <CardContent sx={{ textAlign: 'center', py: isMobile ? 2 : 3 }}>
              <ClockIcon sx={{ fontSize: isMobile ? 30 : 40, color: theme.palette.secondary.main, mb: 1 }} />
              <Typography variant={isMobile ? "h6" : "h5"} component="div" sx={{ fontWeight: 'bold' }}>
                {formatHoursMinutes(summaries.totalTime + (isRunning ? seconds : 0))}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Total Time Studied
              </Typography>
            </CardContent>
          </StatCard>
        </Grid>
      </Grid>
    </Box>
  );
};

export default StudyTimer;