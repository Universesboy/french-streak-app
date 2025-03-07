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
      contrastText: '#000000',
    },
    background: {
      default: '#f5f5f5',
      paper: '#ffffff',
    },
  },
  typography: {
    fontFamily: '"Roboto", "Helvetica", "Arial", sans-serif',
    h4: {
      fontWeight: 600,
    },
    h5: {
      fontWeight: 500,
    },
    h6: {
      fontWeight: 500,
    },
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          textTransform: 'none',
          borderRadius: 8,
          padding: '10px 16px',
        },
        containedPrimary: {
          boxShadow: '0 4px 6px rgba(33, 150, 243, 0.25)',
          '&:hover': {
            boxShadow: '0 6px 10px rgba(33, 150, 243, 0.35)',
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
          boxShadow: '0 2px 8px rgba(0, 0, 0, 0.08)',
        },
        elevation3: {
          boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)',
        },
      },
    },
  },
});

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
function AppContent() {
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
  const [notification, setNotification] = useState({
    open: false,
    message: '',
    severity: 'success' as 'success' | 'error' | 'warning' | 'info'
  });

  // State for tab selection
  const [tabValue, setTabValue] = useState(0);
  
  // Check for mobile view
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

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
    // Check if user can check in today
    if (canCheckInToday(streakData.lastCheckInDate)) {
      // Update streak data
      const updatedData = updateStreakAfterCheckIn(streakData);
      
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
    setTabValue(newValue);
  };
  
  // Handle bottom navigation change
  const handleBottomNavChange = (event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };
  
  // Handle authentication success
  const handleAuthSuccess = () => {
    setAuthView(null);
    setNotification({
      open: true,
      message: currentUser ? 'Welcome back!' : 'Registration successful! You are now logged in.',
      severity: 'success'
    });
  };
  
  // Handle logout
  const handleLogout = () => {
    setTabValue(0); // Reset to main tab
    setNotification({
      open: true,
      message: 'You have been logged out.',
      severity: 'info'
    });
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

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      <Header 
        streakCount={streakData.currentStreak} 
        isLoggedIn={!!currentUser}
        onLoginClick={() => setAuthView('login')}
        onRegisterClick={() => setAuthView('register')}
      />
      
      <Container component="main" sx={{ flexGrow: 1, py: 3 }}>
        {/* Desktop tabs */}
        {!isMobile && (
          <Paper sx={{ mb: 3 }}>
            <Tabs 
              value={tabValue} 
              onChange={handleTabChange} 
              centered
              indicatorColor="primary"
              textColor="primary"
            >
              <Tab icon={<TodayIcon />} label="Today" />
              <Tab icon={<HistoryIcon />} label="History" />
              <Tab icon={<TimerIcon />} label="Timer" />
              {currentUser && <Tab icon={<AccountCircleIcon />} label="Profile" />}
            </Tabs>
          </Paper>
        )}
        
        {/* Tab content */}
        <Box role="tabpanel" hidden={tabValue !== 0}>
          {tabValue === 0 && (
            <Fade in={tabValue === 0}>
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
                    disabled={!canCheckInToday(streakData.lastCheckInDate)}
                    lastCheckIn={streakData.lastCheckInDate}
                  />
                </Box>
                
                <Divider sx={{ my: 4 }} />
                
                <StudyTimeSummary 
                  studySessions={streakData.studySessions}
                  ongoingSession={streakData.ongoingSession}
                />
              </Box>
            </Fade>
          )}
        </Box>
        
        <Box role="tabpanel" hidden={tabValue !== 1}>
          {tabValue === 1 && (
            <Zoom in={tabValue === 1}>
              <Box>
                <StudyHistory 
                  studyDays={streakData.studyDays}
                  studySessions={streakData.studySessions}
                />
              </Box>
            </Zoom>
          )}
        </Box>
        
        <Box role="tabpanel" hidden={tabValue !== 2}>
          {tabValue === 2 && (
            <Slide direction="up" in={tabValue === 2} mountOnEnter unmountOnExit>
              <Box>
                <StudyTimer 
                  onStart={handleTimerStart}
                  onStop={handleTimerStop}
                  isRunning={!!streakData.ongoingSession}
                  startTime={streakData.ongoingSession?.startTime ? new Date(streakData.ongoingSession.startTime) : null}
                />
              </Box>
            </Slide>
          )}
        </Box>
        
        <Box role="tabpanel" hidden={tabValue !== 3 || !currentUser}>
          {tabValue === 3 && currentUser && (
            <Fade in={tabValue === 3}>
              <Box>
                <UserProfile onLogout={handleLogout} />
              </Box>
            </Fade>
          )}
        </Box>
      </Container>
      
      {/* Mobile bottom navigation */}
      {isMobile && (
        <Paper sx={{ position: 'fixed', bottom: 0, left: 0, right: 0 }} elevation={3}>
          <BottomNavigation
            showLabels
            value={tabValue}
            onChange={handleBottomNavChange}
          >
            <BottomNavigationAction label="Today" icon={<TodayIcon />} />
            <BottomNavigationAction label="History" icon={<HistoryIcon />} />
            <BottomNavigationAction label="Timer" icon={<TimerIcon />} />
            {currentUser && <BottomNavigationAction label="Profile" icon={<AccountCircleIcon />} />}
          </BottomNavigation>
        </Paper>
      )}
      
      {/* Notification snackbar */}
      <Snackbar
        open={notification.open}
        autoHideDuration={6000}
        onClose={handleCloseNotification}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert 
          onClose={handleCloseNotification} 
          severity={notification.severity}
          variant="filled"
          sx={{ width: '100%' }}
        >
          {notification.message}
        </Alert>
      </Snackbar>
    </Box>
  );
}

export default AppWithAuth;
