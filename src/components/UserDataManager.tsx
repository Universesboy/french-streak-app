import React, { useState } from 'react';
import { 
  Box, 
  Button, 
  TextField, 
  Typography, 
  Paper, 
  Grid,
  Snackbar,
  Alert,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions
} from '@mui/material';
import { useAuth } from '../utils/AuthContext';
import { initStreakData, saveStreakData, StreakData } from '../utils/streakUtils';

interface UserDataManagerProps {
  onDataUpdated?: () => void;
}

const UserDataManager: React.FC<UserDataManagerProps> = ({ onDataUpdated }) => {
  const { currentUser } = useAuth();
  const [userData, setUserData] = useState<StreakData | null>(null);
  const [loading, setLoading] = useState(false);
  const [notification, setNotification] = useState({
    open: false,
    message: '',
    severity: 'info' as 'info' | 'success' | 'warning' | 'error'
  });
  const [confirmDialog, setConfirmDialog] = useState({
    open: false,
    title: '',
    message: '',
    onConfirm: () => {}
  });

  // Load user data
  const loadUserData = async () => {
    if (!currentUser) {
      setNotification({
        open: true,
        message: 'You must be logged in to manage user data',
        severity: 'warning'
      });
      return;
    }

    setLoading(true);
    try {
      const data = await initStreakData(currentUser.uid);
      setUserData(data);
    } catch (error) {
      console.error('Error loading user data:', error);
      setNotification({
        open: true,
        message: 'Failed to load user data',
        severity: 'error'
      });
    } finally {
      setLoading(false);
    }
  };

  // Save updated user data
  const saveUserData = async () => {
    if (!currentUser || !userData) return;

    setLoading(true);
    try {
      await saveStreakData(userData, currentUser.uid);
      setNotification({
        open: true,
        message: 'User data updated successfully',
        severity: 'success'
      });
      if (onDataUpdated) onDataUpdated();
    } catch (error) {
      console.error('Error saving user data:', error);
      setNotification({
        open: true,
        message: 'Failed to update user data',
        severity: 'error'
      });
    } finally {
      setLoading(false);
    }
  };

  // Handle field changes
  const handleChange = (field: keyof StreakData, value: any) => {
    if (!userData) return;
    
    setUserData({
      ...userData,
      [field]: value
    });
  };

  // Reset user data
  const resetUserData = () => {
    setConfirmDialog({
      open: true,
      title: 'Reset User Data',
      message: 'Are you sure you want to reset all user data? This action cannot be undone.',
      onConfirm: async () => {
        if (!currentUser) return;
        
        const emptyData: StreakData = {
          currentStreak: 0,
          lastCheckInDate: null,
          totalReward: 0,
          studyDays: [],
          longestStreak: 0,
          totalDaysStudied: 0,
          studySessions: [],
          ongoingSession: null
        };
        
        setLoading(true);
        try {
          await saveStreakData(emptyData, currentUser.uid);
          setUserData(emptyData);
          setNotification({
            open: true,
            message: 'User data has been reset',
            severity: 'success'
          });
          if (onDataUpdated) onDataUpdated();
        } catch (error) {
          console.error('Error resetting user data:', error);
          setNotification({
            open: true,
            message: 'Failed to reset user data',
            severity: 'error'
          });
        } finally {
          setLoading(false);
        }
      }
    });
  };

  // Fix common issues
  const fixCommonIssues = async () => {
    if (!userData || !currentUser) return;
    
    setLoading(true);
    try {
      // Fix negative values
      const fixedData = {
        ...userData,
        currentStreak: Math.max(0, userData.currentStreak),
        longestStreak: Math.max(0, userData.longestStreak),
        totalDaysStudied: Math.max(0, userData.totalDaysStudied),
        totalReward: Math.max(0, userData.totalReward)
      };
      
      // Fix duplicate study days
      fixedData.studyDays = [...new Set(fixedData.studyDays)];
      
      // Fix ongoing session if it's been active for more than 24 hours
      if (fixedData.ongoingSession) {
        const startTime = new Date(fixedData.ongoingSession.startTime);
        const now = new Date();
        const hoursDiff = (now.getTime() - startTime.getTime()) / (1000 * 60 * 60);
        
        if (hoursDiff > 24) {
          fixedData.ongoingSession = null;
        }
      }
      
      await saveStreakData(fixedData, currentUser.uid);
      setUserData(fixedData);
      setNotification({
        open: true,
        message: 'Common issues have been fixed',
        severity: 'success'
      });
      if (onDataUpdated) onDataUpdated();
    } catch (error) {
      console.error('Error fixing user data:', error);
      setNotification({
        open: true,
        message: 'Failed to fix user data',
        severity: 'error'
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Paper elevation={3} sx={{ p: 3, mb: 3 }}>
      <Typography variant="h5" gutterBottom>
        User Data Manager
      </Typography>
      
      {!userData ? (
        <Button 
          variant="contained" 
          onClick={loadUserData} 
          disabled={loading || !currentUser}
        >
          Load User Data
        </Button>
      ) : (
        <>
          <Grid container spacing={2} sx={{ mb: 3 }}>
            <Grid item xs={12} sm={6}>
              <TextField
                label="Current Streak"
                type="number"
                fullWidth
                value={userData.currentStreak}
                onChange={(e) => handleChange('currentStreak', parseInt(e.target.value) || 0)}
                disabled={loading}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                label="Longest Streak"
                type="number"
                fullWidth
                value={userData.longestStreak}
                onChange={(e) => handleChange('longestStreak', parseInt(e.target.value) || 0)}
                disabled={loading}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                label="Total Days Studied"
                type="number"
                fullWidth
                value={userData.totalDaysStudied}
                onChange={(e) => handleChange('totalDaysStudied', parseInt(e.target.value) || 0)}
                disabled={loading}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                label="Total Reward"
                type="number"
                fullWidth
                value={userData.totalReward}
                onChange={(e) => handleChange('totalReward', parseInt(e.target.value) || 0)}
                disabled={loading}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                label="Last Check-in Date"
                type="text"
                fullWidth
                value={userData.lastCheckInDate || ''}
                onChange={(e) => handleChange('lastCheckInDate', e.target.value || null)}
                disabled={loading}
                helperText="Format: YYYY-MM-DD or leave empty for null"
              />
            </Grid>
          </Grid>
          
          <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
            <Button 
              variant="contained" 
              color="primary"
              onClick={saveUserData}
              disabled={loading}
            >
              Save Changes
            </Button>
            <Button 
              variant="outlined" 
              color="secondary"
              onClick={fixCommonIssues}
              disabled={loading}
            >
              Fix Common Issues
            </Button>
            <Button 
              variant="outlined" 
              color="error"
              onClick={resetUserData}
              disabled={loading}
            >
              Reset Data
            </Button>
          </Box>
        </>
      )}
      
      {/* Notification */}
      <Snackbar 
        open={notification.open} 
        autoHideDuration={6000} 
        onClose={() => setNotification({ ...notification, open: false })}
      >
        <Alert severity={notification.severity}>
          {notification.message}
        </Alert>
      </Snackbar>
      
      {/* Confirmation Dialog */}
      <Dialog
        open={confirmDialog.open}
        onClose={() => setConfirmDialog({ ...confirmDialog, open: false })}
      >
        <DialogTitle>{confirmDialog.title}</DialogTitle>
        <DialogContent>
          <Typography>{confirmDialog.message}</Typography>
        </DialogContent>
        <DialogActions>
          <Button 
            onClick={() => setConfirmDialog({ ...confirmDialog, open: false })}
            color="primary"
          >
            Cancel
          </Button>
          <Button 
            onClick={() => {
              confirmDialog.onConfirm();
              setConfirmDialog({ ...confirmDialog, open: false });
            }}
            color="error"
            variant="contained"
          >
            Confirm
          </Button>
        </DialogActions>
      </Dialog>
    </Paper>
  );
};

export default UserDataManager; 