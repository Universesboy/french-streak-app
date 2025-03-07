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
  Divider,
  IconButton,
  Tooltip
} from '@mui/material';
import {
  PlayArrow as PlayIcon,
  Stop as StopIcon,
  Timer as TimerIcon,
  BarChart as ChartIcon,
  AccessTime as ClockIcon,
  Info as InfoIcon,
  AutoGraph as AutoGraphIcon,
  Timelapse as TimelapseIcon
} from '@mui/icons-material';
import { formatTime } from '../utils/streakUtils';
import type { StreakData } from '../utils/streakUtils';
import { differenceInSeconds } from 'date-fns';
import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import { motion } from 'framer-motion';

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
      setElapsedTime(0); // Reset elapsed time when not running
      return;
    }
    
    // Check if startTime is valid
    const startTimeMs = startTime.getTime();
    if (isNaN(startTimeMs)) {
      console.error('Invalid startTime:', startTime);
      setElapsedTime(0);
      return;
    }
    
    const intervalId = setInterval(() => {
      const now = new Date();
      const secondsElapsed = differenceInSeconds(now, startTime);
      setElapsedTime(secondsElapsed > 0 ? secondsElapsed : 0);
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

  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { 
      opacity: 1, 
      y: 0,
      transition: {
        duration: 0.4,
        when: "beforeChildren",
        staggerChildren: 0.1
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 10 },
    visible: { 
      opacity: 1, 
      y: 0,
      transition: { duration: 0.3 }
    }
  };

  const timerVariants = {
    hidden: { scale: 0.8, opacity: 0 },
    visible: { 
      scale: 1, 
      opacity: 1,
      transition: { 
        type: "spring",
        stiffness: 200,
        damping: 20,
        delay: 0.2
      }
    }
  };

  const buttonVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: { 
      y: 0, 
      opacity: 1,
      transition: { 
        type: "spring",
        stiffness: 300,
        damping: 15,
        delay: 0.4
      }
    },
    tap: { scale: 0.95 },
    hover: { 
      scale: 1.05,
      boxShadow: '0 8px 16px rgba(0, 0, 0, 0.2)',
    }
  };
  
  return (
    <motion.div
      initial="hidden"
      animate="visible"
      variants={containerVariants}
    >
      <Paper 
        elevation={3} 
        sx={{ 
          p: { xs: 3, md: 4 }, 
          borderRadius: 3,
          backgroundColor: 'rgba(255, 255, 255, 0.9)',
          backdropFilter: 'blur(10px)',
          overflow: 'hidden',
          position: 'relative'
        }}
      >
        {/* Decorative elements */}
        <Box 
          sx={{ 
            position: 'absolute',
            top: -30,
            right: -30,
            width: 150,
            height: 150,
            borderRadius: '50%',
            backgroundColor: isRunning ? 'secondary.light' : 'primary.light',
            opacity: 0.1,
            zIndex: 0
          }}
        />
        
        <motion.div variants={itemVariants}>
          <Typography 
            variant="h5" 
            component="h2" 
            gutterBottom 
            sx={{ 
              fontWeight: 'bold',
              textAlign: 'center',
              mb: 4,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}
          >
            <TimerIcon sx={{ mr: 1.5, color: theme.palette.primary.main }} />
            French Study Timer
          </Typography>
        </motion.div>
        
        <Grid container spacing={4}>
          <Grid item xs={12} md={6}>
            <Box 
              sx={{ 
                display: 'flex', 
                flexDirection: 'column', 
                alignItems: 'center',
                justifyContent: 'center',
                position: 'relative',
                mb: { xs: 4, md: 0 }
              }}
            >
              <motion.div
                variants={timerVariants}
              >
                <Box 
                  sx={{ 
                    position: 'relative', 
                    display: 'inline-flex',
                    mb: 3,
                    transition: 'transform 0.3s ease'
                  }}
                >
                  <CircularProgress
                    variant="determinate"
                    value={calculateProgress()}
                    size={220}
                    thickness={3.5}
                    sx={{
                      color: isRunning ? theme.palette.secondary.main : theme.palette.primary.main,
                      boxShadow: isRunning ? '0 0 30px rgba(255, 107, 107, 0.3)' : 'none',
                      transition: 'all 0.5s ease',
                      '& .MuiCircularProgress-circle': {
                        strokeLinecap: 'round',
                        transition: 'all 0.5s ease'
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
                      flexDirection: 'column',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                  >
                    <Typography
                      variant="h2"
                      component="div"
                      sx={{ 
                        fontWeight: 'bold', 
                        fontFamily: 'monospace',
                        color: isRunning ? theme.palette.secondary.dark : theme.palette.text.primary,
                        transition: 'color 0.5s ease'
                      }}
                    >
                      {formatTime(elapsedTime)}
                    </Typography>
                    <Typography
                      variant="caption"
                      color="text.secondary"
                      sx={{ mt: 1 }}
                    >
                      {isRunning ? 'RECORDING' : 'READY'}
                    </Typography>
                  </Box>
                </Box>
              </motion.div>
              
              <motion.div variants={buttonVariants} whileTap="tap" whileHover="hover">
                <Button
                  variant="contained"
                  color={isRunning ? "error" : "primary"}
                  size="large"
                  startIcon={isRunning ? <StopIcon /> : <PlayArrowIcon />}
                  onClick={isRunning ? onStop : onStart}
                  sx={{ 
                    px: 5, 
                    py: 1.5,
                    borderRadius: 3,
                    fontWeight: 'bold',
                    fontSize: '1.1rem',
                    boxShadow: isRunning ? 
                      '0 6px 16px rgba(244, 67, 54, 0.3)' : 
                      '0 6px 16px rgba(67, 97, 238, 0.3)',
                    background: isRunning ? 
                      'linear-gradient(45deg, #f44336, #ff6b6b)' : 
                      'linear-gradient(45deg, #4361ee, #738aff)'
                  }}
                >
                  {isRunning ? 'Stop Timer' : 'Start Timer'}
                </Button>
              </motion.div>
            </Box>
          </Grid>
          
          <Grid item xs={12} md={6}>
            <motion.div variants={itemVariants}>
              <Card
                sx={{
                  height: '100%',
                  boxShadow: '0 4px 20px rgba(0, 0, 0, 0.08)',
                  borderRadius: 3,
                  position: 'relative',
                  overflow: 'hidden'
                }}
              >
                <CardContent sx={{ p: 3 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                    <InfoIcon sx={{ color: theme.palette.info.main, mr: 1.5 }} />
                    <Typography variant="h6" fontWeight={600}>
                      Timer Instructions
                    </Typography>
                  </Box>
                  
                  <Divider sx={{ mb: 2.5 }} />
                  
                  <Typography variant="body1" paragraph sx={{ display: 'flex', alignItems: 'center' }}>
                    <TimelapseIcon sx={{ mr: 1, color: theme.palette.primary.main }} />
                    Track your French study sessions accurately to monitor your progress.
                  </Typography>
                  
                  <Typography variant="subtitle2" sx={{ mt: 2, mb: 1, fontWeight: 600, color: theme.palette.primary.dark }}>
                    How to use:
                  </Typography>
                  
                  <Box component="ul" sx={{ pl: 3, mb: 0 }}>
                    <Box component="li" sx={{ mb: 1.5 }}>
                      <Typography variant="body2">
                        Click <strong>"Start Timer"</strong> when you begin studying French
                      </Typography>
                    </Box>
                    <Box component="li" sx={{ mb: 1.5 }}>
                      <Typography variant="body2">
                        The timer will continue running even if you close the app or navigate away
                      </Typography>
                    </Box>
                    <Box component="li">
                      <Typography variant="body2">
                        Click <strong>"Stop Timer"</strong> when you finish your study session
                      </Typography>
                    </Box>
                  </Box>
                  
                  <Box 
                    sx={{ 
                      mt: 3,
                      p: 2, 
                      borderRadius: 2,
                      backgroundColor: 'rgba(67, 97, 238, 0.05)',
                      border: '1px dashed',
                      borderColor: 'primary.light',
                      display: 'flex',
                      alignItems: 'center'
                    }}
                  >
                    <AutoGraphIcon sx={{ mr: 1.5, color: theme.palette.primary.main }} />
                    <Typography variant="body2" color="text.secondary">
                      Your study time will be recorded and added to your statistics for tracking progress.
                    </Typography>
                  </Box>
                </CardContent>
              </Card>
            </motion.div>
          </Grid>
        </Grid>
      </Paper>
    </motion.div>
  );
};

export default StudyTimer;