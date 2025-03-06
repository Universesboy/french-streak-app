import { useState, useEffect } from 'react';
import { 
  CssBaseline, 
  Container, 
  Box, 
  ThemeProvider, 
  createTheme,
  Paper,
  Snackbar,
  Alert,
  Tabs,
  Tab,
  Divider,
  BottomNavigation,
  BottomNavigationAction,
  useMediaQuery,
  Fade,
  Zoom,
  Slide
} from '@mui/material';
import Header from './components/Header';
import StreakCard from './components/StreakCard';
import CheckInButton from './components/CheckInButton';
import StudyHistory from './components/StudyHistory';
import StudyTimer from './components/StudyTimer';
import StudyTimeSummary from './components/StudyTimeSummary';
import { 
  initStreakData, 
  saveStreakData, 
  updateStreakAfterCheckIn, 
  canCheckInToday,
  startStudySession,
  endStudySession,
  StreakData 
} from './utils/streakUtils';
import TodayIcon from '@mui/icons-material/Today';
import HistoryIcon from '@mui/icons-material/History';
import TimerIcon from '@mui/icons-material/Timer';

// Create a theme
const theme = createTheme({
  palette: {
    primary: {
      main: '#2196f3',
      light: '#64b5f6',
      dark: '#1976d2',
      contrastText: '#ffffff',
    },
    secondary: {
      main: '#ff9800',
      light: '#ffb74d',
      dark: '#f57c00',
      contrastText: '#ffffff',
    },
    success: {
      main: '#4caf50',
      light: '#81c784',
      dark: '#388e3c',
      contrastText: '#ffffff',
    },
    background: {
      default: '#f5f5f5',
      paper: '#ffffff',
    },
    text: {
      primary: 'rgba(0, 0, 0, 0.87)',
      secondary: 'rgba(0, 0, 0, 0.6)',
    },
  },
  typography: {
    fontFamily: '"Roboto", "Helvetica", "Arial", sans-serif',
    h4: {
      fontWeight: 600,
    },
    h5: {
      fontWeight: 600,
    },
    h6: {
      fontWeight: 600,
    },
    subtitle1: {
      fontWeight: 500,
    },
    button: {
      fontWeight: 600,
    },
  },
  shape: {
    borderRadius: 8,
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          textTransform: 'none',
          fontWeight: 600,
          boxShadow: '0 2px 6px rgba(0, 0, 0, 0.1)',
          borderRadius: 8,
        },
        containedPrimary: {
          '&:hover': {
            boxShadow: '0 4px 10px rgba(33, 150, 243, 0.3)',
          },
        },
        containedSecondary: {
          '&:hover': {
            boxShadow: '0 4px 10px rgba(255, 152, 0, 0.3)',
          },
        },
        containedSuccess: {
          backgroundColor: '#4caf50',
          '&:hover': {
            backgroundColor: '#388e3c',
            boxShadow: '0 4px 10px rgba(76, 175, 80, 0.3)',
          },
        },
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          borderRadius: 12,
        },
        elevation1: {
          boxShadow: '0 2px 8px rgba(0, 0, 0, 0.08)',
        },
        elevation2: {
          boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)',
        },
      },
    },
    MuiBottomNavigation: {
      styleOverrides: {
        root: {
          height: 70,
        },
      },
    },
    MuiBottomNavigationAction: {
      styleOverrides: {
        root: {
          paddingTop: 8,
          '&.Mui-selected': {
            paddingTop: 8,
          },
        },
        label: {
          fontSize: '0.75rem',
          '&.Mui-selected': {
            fontSize: '0.75rem',
          },
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: 12,
          overflow: 'hidden',
        },
      },
    },
    MuiSnackbar: {
      styleOverrides: {
        root: {
          '& .MuiAlert-root': {
            borderRadius: 8,
          },
        },
      },
    },
    MuiTab: {
      styleOverrides: {
        root: {
          textTransform: 'none',
        },
      },
    },
  },
});

function App() {
  // State to track streak data
  const [streakData, setStreakData] = useState<StreakData>({
    currentStreak: 0,
    lastCheckInDate: null,
    totalReward: 0,
    studyDays: [],
    longestStreak: 0,
    totalDaysStudied: 0,
    studySessions: [],
    ongoingSession: null
  });
  
  // State for notification
  const [notification, setNotification] = useState({
    open: false,
    message: '',
    severity: 'success' as 'success' | 'error' | 'warning' | 'info'
  });

  // State for tab selection
  const [tabValue, setTabValue] = useState(0);
  
  // Check for mobile view
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  // Initialize data from localStorage on component mount
  useEffect(() => {
    const data = initStreakData();
    setStreakData(data);
    
    // Check if there's an active session
    if (data.ongoingSession) {
      setNotification({
        open: true,
        message: 'You have an active study session in progress.',
        severity: 'info'
      });
    }
  }, []);

  // Handle daily check-in
  const handleCheckIn = () => {
    // Check if user can check in today
    if (canCheckInToday(streakData.lastCheckInDate)) {
      // Update streak data
      const updatedData = updateStreakAfterCheckIn(streakData);
      
      // Save to state and localStorage
      setStreakData(updatedData);
      saveStreakData(updatedData);
      
      // Show success notification
      setNotification({
        open: true,
        message: updatedData.currentStreak > 1 
          ? `Great job! Your streak is now ${updatedData.currentStreak} days!` 
          : 'Great start! Keep learning tomorrow to build your streak!',
        severity: 'success'
      });
    } else {
      // Show error notification if already checked in
      setNotification({
        open: true,
        message: 'You already checked in today. Come back tomorrow!',
        severity: 'info'
      });
    }
  };
  
  // Handle study timer start
  const handleTimerStart = () => {
    const updatedData = startStudySession(streakData);
    setStreakData(updatedData);
    saveStreakData(updatedData);
    
    setNotification({
      open: true,
      message: 'Study timer started! Your study time is now being tracked.',
      severity: 'info'
    });
  };
  
  // Handle study timer stop
  const handleTimerStop = () => {
    const updatedData = endStudySession(streakData);
    setStreakData(updatedData);
    saveStreakData(updatedData);
    
    // Calculate the duration of the session that just ended
    let lastSessionDuration = 0;
    if (updatedData.studySessions.length > 0) {
      const lastSession = updatedData.studySessions[updatedData.studySessions.length - 1];
      lastSessionDuration = lastSession.duration;
    }
    
    // Format minutes and seconds for display
    const minutes = Math.floor(lastSessionDuration / 60);
    const seconds = lastSessionDuration % 60;
    
    // Create a message with proper pluralization
    const minuteText = minutes === 1 ? 'minute' : 'minutes';
    const secondText = seconds === 1 ? 'second' : 'seconds';
    
    const message = minutes > 0 
      ? `Study session ended! You studied for ${minutes} ${minuteText} and ${seconds} ${secondText}.`
      : `Study session ended! You studied for ${seconds} ${secondText}.`;
    
    setNotification({
      open: true,
      message,
      severity: 'success'
    });
  };
  
  // Handle closing the notification
  const handleCloseNotification = () => {
    setNotification(prev => ({ ...prev, open: false }));
  };

  // Handle tab change
  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };
  
  // Handle bottom navigation change (for mobile)
  const handleBottomNavChange = (event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };

  // Render the current tab content
  const renderTabContent = () => {
    switch (tabValue) {
      case 0: // Today
        return (
          <Fade in={true} timeout={500}>
            <Box>
              <StreakCard 
                currentStreak={streakData.currentStreak} 
                totalReward={streakData.totalReward} 
              />
              
              <CheckInButton 
                onCheckIn={handleCheckIn}
                canCheckIn={canCheckInToday(streakData.lastCheckInDate)}
                lastCheckInDate={streakData.lastCheckInDate}
              />
              
              <StudyTimer 
                streakData={streakData}
                onTimerStart={handleTimerStart}
                onTimerStop={handleTimerStop}
              />
            </Box>
          </Fade>
        );
        
      case 1: // History
        return (
          <Fade in={true} timeout={500}>
            <Box>
              <StudyHistory streakData={streakData} />
            </Box>
          </Fade>
        );
        
      case 2: // Time Summary
        return (
          <Fade in={true} timeout={500}>
            <Box>
              <StudyTimeSummary streakData={streakData} />
            </Box>
          </Fade>
        );
        
      default:
        return null;
    }
  };

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Box sx={{ 
        minHeight: '100vh',
        backgroundColor: 'background.default',
        display: 'flex',
        flexDirection: 'column',
        pb: isMobile ? 10 : 4 // Add padding at bottom for mobile navigation
      }}>
        <Header />
        
        <Container maxWidth="md" sx={{ mt: 3, mb: 4, flex: 1 }}>
          {!isMobile ? (
            // Desktop tabs
            <Tabs
              value={tabValue}
              onChange={handleTabChange}
              aria-label="app navigation"
              centered
              sx={{ 
                mb: 3,
                '& .MuiTab-root': {
                  minWidth: 120,
                  fontSize: '1rem',
                  fontWeight: 500,
                  borderRadius: '8px 8px 0 0',
                  transition: 'all 0.2s',
                  '&.Mui-selected': {
                    fontWeight: 700,
                    backgroundColor: 'rgba(33, 150, 243, 0.08)',
                  },
                  '&:not(.Mui-selected):hover': {
                    backgroundColor: 'rgba(0, 0, 0, 0.04)',
                  },
                },
              }}
            >
              <Tab icon={<TodayIcon />} label="Today" iconPosition="start" />
              <Tab icon={<HistoryIcon />} label="History" iconPosition="start" />
              <Tab icon={<TimerIcon />} label="Time Summary" iconPosition="start" />
            </Tabs>
          ) : null}
          
          <Divider sx={{ mb: 3, display: { xs: 'none', sm: 'block' } }} />
          
          <Paper 
            elevation={0} 
            sx={{ 
              p: { xs: 2, sm: 4 }, 
              borderRadius: 4,
              backgroundColor: 'transparent',
              overflow: 'hidden', // Needed for Fade animation
              boxShadow: 'none'
            }}
          >
            {renderTabContent()}
          </Paper>
        </Container>
        
        {/* Mobile Bottom Navigation */}
        {isMobile && (
          <Slide direction="up" in={true} mountOnEnter unmountOnExit>
            <Paper 
              elevation={3} 
              sx={{ 
                position: 'fixed', 
                bottom: 0, 
                left: 0, 
                right: 0, 
                zIndex: 1000,
                borderRadius: '16px 16px 0 0',
                overflow: 'hidden'
              }}
            >
              <BottomNavigation
                showLabels
                value={tabValue}
                onChange={handleBottomNavChange}
                sx={{
                  boxShadow: '0px -2px 10px rgba(0, 0, 0, 0.1)',
                }}
              >
                <BottomNavigationAction 
                  label="Today" 
                  icon={<TodayIcon />} 
                />
                <BottomNavigationAction 
                  label="History" 
                  icon={<HistoryIcon />} 
                />
                <BottomNavigationAction 
                  label="Time" 
                  icon={<TimerIcon />} 
                />
              </BottomNavigation>
            </Paper>
          </Slide>
        )}
        
        <Snackbar 
          open={notification.open} 
          autoHideDuration={6000}
          onClose={handleCloseNotification}
          anchorOrigin={{ 
            vertical: isMobile ? 'top' : 'bottom', 
            horizontal: 'center' 
          }}
          sx={{ 
            mb: isMobile ? 0 : 2,
            bottom: isMobile ? 'auto' : 80
          }}
          TransitionComponent={Zoom}
        >
          <Alert 
            onClose={handleCloseNotification} 
            severity={notification.severity}
            sx={{ 
              width: '100%', 
              borderRadius: 2, 
              boxShadow: '0 2px 10px rgba(0,0,0,0.1)' 
            }}
            variant="filled"
          >
            {notification.message}
          </Alert>
        </Snackbar>
      </Box>
    </ThemeProvider>
  );
}

export default App;
