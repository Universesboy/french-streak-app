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
  Slide,
  Button,
  IconButton
} from '@mui/material';
import Header from './components/Header';
import StreakCard from './components/StreakCard';
import CheckInButton from './components/CheckInButton';
import StudyHistory from './components/StudyHistory';
import StudyTimer from './components/StudyTimer';
import StudyTimeSummary from './components/StudyTimeSummary';
import Login from './components/Login';
import Register from './components/Register';
import UserProfile from './components/UserProfile';
import { AuthProvider, useAuth } from './utils/AuthContext';
import { logoutUser } from './utils/firebase';
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
import AccountCircleIcon from '@mui/icons-material/AccountCircle';
import { motion } from 'framer-motion';

// Create a theme
const theme = createTheme({
  palette: {
    primary: {
      main: '#4361EE', // Vibrant blue
      light: '#738AFF',
      dark: '#2D41BC',
      contrastText: '#ffffff',
    },
    secondary: {
      main: '#FF6B6B', // Energetic coral
      light: '#FF9E9E',
      dark: '#D94F4F',
      contrastText: '#ffffff',
    },
    background: {
      default: '#F8F9FA',
      paper: '#ffffff',
    },
    success: {
      main: '#4CAF50',
      light: '#80E27E',
      dark: '#087f23',
    },
    error: {
      main: '#f44336',
      light: '#e57373',
      dark: '#d32f2f',
    },
    info: {
      main: '#03a9f4',
      light: '#4fc3f7',
      dark: '#0276aa',
    },
    warning: {
      main: '#ff9800',
      light: '#ffb74d',
      dark: '#f57c00',
    },
  },
  typography: {
    fontFamily: '"Inter", "Roboto", "Helvetica", "Arial", sans-serif',
    h1: {
      fontWeight: 700,
      fontSize: '2.5rem',
    },
    h2: {
      fontWeight: 700,
      fontSize: '2rem',
    },
    h3: {
      fontWeight: 600,
      fontSize: '1.75rem',
    },
    h4: {
      fontWeight: 600,
      fontSize: '1.5rem',
    },
    h5: {
      fontWeight: 600,
      fontSize: '1.25rem',
    },
    h6: {
      fontWeight: 600,
      fontSize: '1.1rem',
    },
    subtitle1: {
      fontWeight: 500,
      fontSize: '1rem',
    },
    subtitle2: {
      fontWeight: 500,
      fontSize: '0.875rem',
    },
    body1: {
      fontSize: '1rem',
      lineHeight: 1.6,
    },
    body2: {
      fontSize: '0.875rem',
      lineHeight: 1.6,
    },
    button: {
      fontWeight: 600,
      textTransform: 'none',
    },
  },
  shape: {
    borderRadius: 12,
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          textTransform: 'none',
          borderRadius: 8,
          padding: '10px 16px',
          fontWeight: 600,
          boxShadow: 'none',
          transition: 'all 0.2s ease-in-out',
          '&:hover': {
            transform: 'translateY(-2px)',
            boxShadow: '0 6px 12px rgba(0, 0, 0, 0.1)',
          },
        },
        containedPrimary: {
          background: 'linear-gradient(45deg, #4361EE, #738AFF)',
          '&:hover': {
            background: 'linear-gradient(45deg, #2D41BC, #4361EE)',
          },
        },
        containedSecondary: {
          background: 'linear-gradient(45deg, #FF6B6B, #FF9E9E)',
          '&:hover': {
            background: 'linear-gradient(45deg, #D94F4F, #FF6B6B)',
          },
        },
      },
    },
    MuiPaper: {
      styleOverrides: {
        rounded: {
          borderRadius: 12,
        },
        elevation1: {
          boxShadow: '0 2px 8px rgba(0, 0, 0, 0.05)',
        },
        elevation2: {
          boxShadow: '0 4px 12px rgba(0, 0, 0, 0.08)',
        },
        elevation3: {
          boxShadow: '0 6px 16px rgba(0, 0, 0, 0.1)',
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: 12,
          overflow: 'hidden',
          transition: 'transform 0.2s, box-shadow 0.2s',
          '&:hover': {
            transform: 'translateY(-4px)',
            boxShadow: '0 10px 20px rgba(0, 0, 0, 0.12)',
          },
        },
      },
    },
    MuiTab: {
      styleOverrides: {
        root: {
          textTransform: 'none',
          fontWeight: 600,
          minWidth: 100,
          '&.Mui-selected': {
            color: '#4361EE',
          },
        },
      },
    },
    MuiTabs: {
      styleOverrides: {
        indicator: {
          height: 3,
          borderRadius: 1.5,
        },
      },
    },
    MuiChip: {
      styleOverrides: {
        root: {
          borderRadius: 8,
          fontWeight: 500,
        },
      },
    },
    MuiCircularProgress: {
      styleOverrides: {
        circle: {
          strokeLinecap: 'round',
        },
      },
    },
  },
});

// Before the AppContent function, add this interface
interface Notification {
  open: boolean;
  message: string;
  severity: 'success' | 'error' | 'warning' | 'info';
}

// Main App component wrapped with AuthProvider
const AppWithAuth = () => {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <AuthProvider>
        <AppContent />
      </AuthProvider>
    </ThemeProvider>
  );
};

// App content with authentication
function AppContent(): JSX.Element {
  // Get authentication state
  const { currentUser } = useAuth();
  
  // State to track authentication UI
  const [authView, setAuthView] = useState<'login' | 'register' | null>(null);
  
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
  const [notification, setNotification] = useState<Notification>({
    open: false,
    message: '',
    severity: 'info'
  });

  // State for tab selection
  const [tabValue, setTabValue] = useState(0);
  
  // Check for mobile view
  const isMobile = useMediaQuery('(max-width:600px)');

  // State for loading
  const [isCheckingIn, setIsCheckingIn] = useState(false);

  // Initialize data from localStorage or Firebase on component mount or user change
  useEffect(() => {
    const loadData = async () => {
      try {
        // Initialize with default empty values
        const initialData: StreakData = {
          currentStreak: 0,
          lastCheckInDate: null,
          totalReward: 0,
          studyDays: [],
          longestStreak: 0,
          totalDaysStudied: 0,
          studySessions: [],
          ongoingSession: null
        };
        
        // Try to load data from Firebase or localStorage
        const data = await initStreakData(currentUser?.uid);
        
        // Make sure we're not setting undefined or null values
        setStreakData(data || initialData);
        
        // Check if there's an active session
        if (data?.ongoingSession) {
          setNotification({
            open: true,
            message: 'You have an active study session in progress.',
            severity: 'info'
          });
        }
      } catch (error) {
        console.error('Error loading streak data:', error);
        setNotification({
          open: true,
          message: 'Failed to load your data. Please try again.',
          severity: 'error'
        });
      }
    };
    
    loadData();
  }, [currentUser]);

  // Handle daily check-in
  const handleCheckIn = async () => {
    // Prevent multiple clicks
    if (isCheckingIn) return;
    
    // Double-check if user can check in today before processing
    if (!canCheckInToday(streakData.lastCheckInDate)) {
      setNotification({
        open: true,
        message: 'You already checked in today. Come back tomorrow!',
        severity: 'info'
      });
      return;
    }
    
    setIsCheckingIn(true);
    console.log('Starting check-in process...');
    
    try {
      // Update streak data
      const updatedData = updateStreakAfterCheckIn(streakData);
      
      // Verify the update actually changed the lastCheckInDate (extra safety check)
      if (updatedData.lastCheckInDate === streakData.lastCheckInDate) {
        console.log('Check-in had no effect, possible duplicate');
        setNotification({
          open: true,
          message: 'You already checked in today. Come back tomorrow!',
          severity: 'info'
        });
        setIsCheckingIn(false);
        return;
      }
      
      // Save to state and storage
      setStreakData(updatedData);
      await saveStreakData(updatedData, currentUser?.uid);
      
      // Show success notification
      setNotification({
        open: true,
        message: updatedData.currentStreak > 1 
          ? `Great job! Your streak is now ${updatedData.currentStreak} days!` 
          : 'Great start! Keep learning tomorrow to build your streak!',
        severity: 'success'
      });
    } catch (error) {
      console.error('Error checking in:', error);
      setNotification({
        open: true,
        message: 'Failed to check in. Please try again.',
        severity: 'error'
      });
    } finally {
      setIsCheckingIn(false);
    }
  };
  
  // Handle study timer start
  const handleTimerStart = async () => {
    console.log('Starting timer...');
    try {
      const updatedData = startStudySession(streakData);
      console.log('Session started:', updatedData.ongoingSession);
      setStreakData(updatedData);
      await saveStreakData(updatedData, currentUser?.uid);
      
      setNotification({
        open: true,
        message: 'Study timer started! Your study time is now being tracked.',
        severity: 'info'
      });
    } catch (error) {
      console.error('Error starting timer:', error);
      setNotification({
        open: true,
        message: 'Failed to start timer. Please try again.',
        severity: 'error'
      });
    }
  };
  
  // Handle study timer stop
  const handleTimerStop = async () => {
    console.log('Stopping timer...');
    try {
      if (!streakData.ongoingSession) {
        console.warn('No ongoing session to stop');
        return;
      }
      
      const updatedData = endStudySession(streakData);
      console.log('Session ended:', updatedData.studySessions[updatedData.studySessions.length - 1]);
      setStreakData(updatedData);
      await saveStreakData(updatedData, currentUser?.uid);
      
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
    } catch (error) {
      console.error('Error stopping timer:', error);
      setNotification({
        open: true,
        message: 'Failed to stop timer. Please try again.',
        severity: 'error'
      });
    }
  };
  
  // Handle closing the notification
  const handleCloseNotification = () => {
    setNotification(prev => ({ ...prev, open: false }));
  };
  
  // Handle tab change
  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    if (Number.isInteger(newValue) && newValue >= 0 && newValue <= 3) {
      setTabValue(newValue);
    }
  };
  
  // Handle bottom navigation change
  const handleBottomNavChange = (event: React.SyntheticEvent, newValue: number) => {
    if (Number.isInteger(newValue) && newValue >= 0 && newValue <= 3) {
      setTabValue(newValue);
    }
  };
  
  // Handle successful authentication
  const handleAuthSuccess = async () => {
    setAuthView(null); // Close auth view
    
    try {
      // Get fresh data after login
      const data = await initStreakData(currentUser?.uid);
      setStreakData(data);
      
      // Show success notification
      setNotification({
        open: true,
        message: 'Login successful! Your progress has been loaded.',
        severity: 'success'
      });
    } catch (error) {
      console.error('Error loading data after login:', error);
      setNotification({
        open: true,
        message: 'Logged in, but there was an issue loading your data.',
        severity: 'warning'
      });
    }
  };
  
  // Handle logout
  const handleLogout = async () => {
    try {
      // Ensure current data is saved before logout
      if (streakData.ongoingSession) {
        // If there's an active session, end it before logout
        const updatedData = endStudySession(streakData);
        await saveStreakData(updatedData, currentUser?.uid);
      } else {
        // Otherwise just save the current data
        await saveStreakData(streakData, currentUser?.uid);
      }
      
      // Perform logout
      await logoutUser();
      
      setTabValue(0); // Reset to main tab
      setNotification({
        open: true,
        message: 'Your progress has been saved and you have been logged out.',
        severity: 'info'
      });
    } catch (error) {
      console.error('Error during logout:', error);
      setNotification({
        open: true,
        message: 'There was a problem logging out. Please try again.',
        severity: 'error'
      });
    }
  };
  
  // If showing auth view, render login or register
  if (authView === 'login') {
    return (
      <Login 
        onSuccess={handleAuthSuccess} 
        onRegisterClick={() => setAuthView('register')} 
      />
    );
  }
  
  if (authView === 'register') {
    return (
      <Register 
        onSuccess={handleAuthSuccess} 
        onLoginClick={() => setAuthView('login')} 
      />
    );
  }

  // Define motion variants
  const pageTransition = {
    type: 'tween',
    ease: 'anticipate',
    duration: 0.5
  };

  const pageVariants = {
    initial: { opacity: 0, y: 20 },
    in: { opacity: 1, y: 0 },
    out: { opacity: 0, y: -20 }
  };

  return (
    <Box 
      sx={{ 
        display: 'flex', 
        flexDirection: 'column', 
        minHeight: '100vh',
        background: 'linear-gradient(145deg, rgba(248, 249, 250, 0.9) 0%, rgba(241, 242, 246, 0.75) 100%)',
        backgroundSize: 'cover',
        backgroundAttachment: 'fixed'
      }}
    >
      <Header 
        streakCount={streakData.currentStreak} 
        isLoggedIn={!!currentUser}
        onLoginClick={() => setAuthView('login')}
        onRegisterClick={() => setAuthView('register')}
      />
      
      <Container component="main" sx={{ flexGrow: 1, py: 3, position: 'relative' }}>
        {/* Desktop tabs */}
        {!isMobile && (
          <Box sx={{ mb: 3 }}>
            <Tabs 
              value={tabValue} 
              onChange={handleTabChange} 
              centered
              indicatorColor="primary"
              textColor="primary"
              sx={{
                '& .MuiTabs-indicator': {
                  height: 3,
                  borderRadius: 1.5
                },
                '& .MuiTab-root': {
                  minWidth: 120,
                  fontWeight: 600,
                  fontSize: '1rem',
                  borderRadius: '8px 8px 0 0',
                  mx: 0.5,
                  '&.Mui-selected': {
                    color: 'primary.main',
                  }
                }
              }}
            >
              <Tab 
                icon={<TodayIcon />} 
                label="Today" 
                sx={{ 
                  borderBottom: tabValue === 0 ? 3 : 0,
                  borderColor: 'transparent'
                }}
              />
              <Tab 
                icon={<HistoryIcon />} 
                label="History" 
                sx={{ 
                  borderBottom: tabValue === 1 ? 3 : 0,
                  borderColor: 'transparent'
                }}
              />
              <Tab 
                icon={<TimerIcon />} 
                label="Timer" 
                sx={{ 
                  borderBottom: tabValue === 2 ? 3 : 0,
                  borderColor: 'transparent'
                }}
              />
              {currentUser && (
                <Tab 
                  icon={<AccountCircleIcon />} 
                  label="Profile" 
                  sx={{ 
                    borderBottom: tabValue === 3 ? 3 : 0,
                    borderColor: 'transparent'
                  }}
                />
              )}
            </Tabs>
          </Box>
        )}
        
        {/* Tab content with animations */}
        <motion.div
          key={tabValue}
          initial="initial"
          animate="in"
          exit="out"
          variants={pageVariants}
          transition={pageTransition}
        >
          {tabValue === 0 && (
            <Box>
              <StreakCard 
                currentStreak={streakData.currentStreak}
                longestStreak={streakData.longestStreak}
                totalDaysStudied={streakData.totalDaysStudied}
                totalReward={streakData.totalReward}
              />
              
              <Box sx={{ mt: 3 }}>
                <CheckInButton 
                  onCheckIn={handleCheckIn}
                  disabled={!canCheckInToday(streakData.lastCheckInDate) || isCheckingIn}
                  lastCheckIn={streakData.lastCheckInDate}
                />
              </Box>
              
              <Box sx={{ mt: 4 }}>
                <StudyTimeSummary 
                  studySessions={streakData.studySessions}
                  ongoingSession={streakData.ongoingSession}
                />
              </Box>
            </Box>
          )}
          
          {tabValue === 1 && (
            <Box>
              <StudyHistory 
                studyDays={streakData.studyDays}
                studySessions={streakData.studySessions}
              />
            </Box>
          )}
          
          {tabValue === 2 && (
            <Box>
              <StudyTimer 
                onStart={handleTimerStart}
                onStop={handleTimerStop}
                isRunning={!!streakData.ongoingSession}
                startTime={streakData.ongoingSession?.startTime ? new Date(streakData.ongoingSession.startTime) : null}
              />
            </Box>
          )}
          
          {tabValue === 3 && currentUser && (
            <Box>
              <UserProfile onLogout={handleLogout} />
            </Box>
          )}
        </motion.div>
      </Container>
      
      {/* Mobile bottom navigation */}
      {isMobile && (
        <Paper 
          sx={{ 
            position: 'fixed', 
            bottom: 0, 
            left: 0, 
            right: 0,
            zIndex: 10,
            borderRadius: '16px 16px 0 0',
            boxShadow: '0 -4px 10px rgba(0, 0, 0, 0.05)'
          }} 
          elevation={3}
        >
          <BottomNavigation
            showLabels
            value={tabValue}
            onChange={handleBottomNavChange}
            sx={{
              height: 65,
              '& .MuiBottomNavigationAction-root': {
                padding: '6px 0 8px',
                minWidth: 'auto',
                '&.Mui-selected': {
                  paddingTop: 6
                }
              },
              '& .MuiBottomNavigationAction-label': {
                fontWeight: 500,
                fontSize: '0.7rem',
                '&.Mui-selected': {
                  fontSize: '0.7rem'
                }
              }
            }}
          >
            <BottomNavigationAction 
              label="Today" 
              icon={<TodayIcon />} 
              sx={{
                '&.Mui-selected': {
                  color: 'primary.main'
                }
              }}
            />
            <BottomNavigationAction 
              label="History" 
              icon={<HistoryIcon />} 
              sx={{
                '&.Mui-selected': {
                  color: 'primary.main'
                }
              }}
            />
            <BottomNavigationAction 
              label="Timer" 
              icon={<TimerIcon />} 
              sx={{
                '&.Mui-selected': {
                  color: 'primary.main'
                }
              }}
            />
            {currentUser && (
              <BottomNavigationAction 
                label="Profile" 
                icon={<AccountCircleIcon />} 
                sx={{
                  '&.Mui-selected': {
                    color: 'primary.main'
                  }
                }}
              />
            )}
          </BottomNavigation>
        </Paper>
      )}
      
      {/* Notification snackbar */}
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
          // Ensure it's above bottom navigation on mobile
          zIndex: 9999
        }}
      >
        <Alert 
          onClose={handleCloseNotification} 
          severity={notification.severity}
          variant="filled"
          sx={{ 
            width: '100%',
            boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
            borderRadius: 2
          }}
        >
          {notification.message}
        </Alert>
      </Snackbar>
    </Box>
  );
}

export default AppWithAuth;
