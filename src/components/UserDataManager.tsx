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
  DialogActions,
  Tabs,
  Tab,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  IconButton,
  Divider,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip
} from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';
import AddIcon from '@mui/icons-material/Add';
import CalendarMonthIcon from '@mui/icons-material/CalendarMonth';
import TimerIcon from '@mui/icons-material/Timer';
import LocalFireDepartmentIcon from '@mui/icons-material/LocalFireDepartment';
import { useAuth } from '../utils/AuthContext';
import { initStreakData, saveStreakData, StreakData, StudySession } from '../utils/streakUtils';
import { format, parseISO, isValid } from 'date-fns';

interface UserDataManagerProps {
  onDataUpdated?: () => void;
}

const UserDataManager: React.FC<UserDataManagerProps> = ({ onDataUpdated }) => {
  const { currentUser } = useAuth();
  const [userData, setUserData] = useState<StreakData | null>(null);
  const [loading, setLoading] = useState(false);
  const [tabValue, setTabValue] = useState(0);
  const [editingSession, setEditingSession] = useState<{
    index: number;
    session: StudySession;
  } | null>(null);
  const [newStudyDay, setNewStudyDay] = useState('');
  const [newSession, setNewSession] = useState<Partial<StudySession>>({
    startTime: '',
    endTime: '',
    duration: 0,
    date: ''
  });
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

  // Handle tab change
  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };

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

  // Handle field changes for basic stats
  const handleChange = (field: keyof StreakData, value: any) => {
    if (!userData) return;
    
    setUserData({
      ...userData,
      [field]: value
    });
  };

  // Add a new study day
  const handleAddStudyDay = () => {
    if (!userData || !newStudyDay.trim() || loading) return;
    
    // Validate the study day format (YYYY-MM-DD)
    const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
    if (!dateRegex.test(newStudyDay)) {
      setNotification({
        open: true,
        message: 'Please use the format YYYY-MM-DD for the study day',
        severity: 'warning'
      });
      return;
    }
    
    // Avoid duplicates
    if (userData.studyDays.includes(newStudyDay)) {
      setNotification({
        open: true,
        message: 'This study day already exists',
        severity: 'warning'
      });
      return;
    }
    
    const updatedUserData = {
      ...userData,
      studyDays: [...userData.studyDays, newStudyDay].sort(),
      totalDaysStudied: userData.totalDaysStudied + 1
    };
    
    setUserData(updatedUserData);
    setNewStudyDay('');
  };

  // Remove a study day
  const handleRemoveStudyDay = (dayToRemove: string) => {
    if (!userData || loading) return;
    
    const updatedStudyDays = userData.studyDays.filter(day => day !== dayToRemove);
    
    setUserData({
      ...userData,
      studyDays: updatedStudyDays,
      totalDaysStudied: updatedStudyDays.length
    });
  };

  // Add a new study session
  const handleAddSession = () => {
    if (!userData || loading) return;
    
    // Validate inputs
    if (!newSession.date || !newSession.startTime) {
      setNotification({
        open: true,
        message: 'Please provide at least a date and start time',
        severity: 'warning'
      });
      return;
    }
    
    // Create ISO strings
    const startTimeIso = new Date(newSession.startTime).toISOString();
    let endTimeIso: string | null = null;
    let duration = 0;
    
    if (newSession.endTime) {
      endTimeIso = new Date(newSession.endTime).toISOString();
      
      // Calculate duration in seconds
      duration = (new Date(endTimeIso).getTime() - new Date(startTimeIso).getTime()) / 1000;
      
      if (duration < 0) {
        setNotification({
          open: true,
          message: 'End time cannot be before start time',
          severity: 'warning'
        });
        return;
      }
    }
    
    const newSessionItem: StudySession = {
      startTime: startTimeIso,
      endTime: endTimeIso,
      duration: duration,
      date: newSession.date
    };
    
    const updatedUserData = {
      ...userData,
      studySessions: [...userData.studySessions, newSessionItem]
    };
    
    // Also add the day to study days if it doesn't exist
    if (!updatedUserData.studyDays.includes(newSession.date)) {
      updatedUserData.studyDays = [...updatedUserData.studyDays, newSession.date].sort();
      updatedUserData.totalDaysStudied = updatedUserData.studyDays.length;
    }
    
    setUserData(updatedUserData);
    setNewSession({
      startTime: '',
      endTime: '',
      duration: 0,
      date: ''
    });
  };

  // Edit a study session
  const handleEditSession = (index: number) => {
    if (!userData || loading) return;
    
    const session = userData.studySessions[index];
    if (!session) return;
    
    // Convert ISO strings to datetime-local format
    const startTimeLocal = session.startTime ? format(new Date(session.startTime), "yyyy-MM-dd'T'HH:mm") : '';
    const endTimeLocal = session.endTime ? format(new Date(session.endTime), "yyyy-MM-dd'T'HH:mm") : '';
    
    setEditingSession({
      index,
      session: {
        ...session,
        startTime: startTimeLocal,
        endTime: endTimeLocal || null
      }
    });
  };

  // Save edited session
  const handleSaveSession = () => {
    if (!userData || !editingSession || loading) return;
    
    const { index, session } = editingSession;
    
    // Validate inputs
    if (!session.date || !session.startTime) {
      setNotification({
        open: true,
        message: 'Please provide at least a date and start time',
        severity: 'warning'
      });
      return;
    }
    
    // Create ISO strings
    const startTimeIso = typeof session.startTime === 'string' 
      ? new Date(session.startTime).toISOString() 
      : session.startTime;
      
    let endTimeIso: string | null = null;
    let duration = 0;
    
    if (session.endTime) {
      endTimeIso = typeof session.endTime === 'string' 
        ? new Date(session.endTime).toISOString() 
        : session.endTime;
      
      // Calculate duration in seconds
      duration = (new Date(endTimeIso).getTime() - new Date(startTimeIso).getTime()) / 1000;
      
      if (duration < 0) {
        setNotification({
          open: true,
          message: 'End time cannot be before start time',
          severity: 'warning'
        });
        return;
      }
    }
    
    const updatedSession: StudySession = {
      startTime: startTimeIso,
      endTime: endTimeIso,
      duration: duration,
      date: session.date
    };
    
    const updatedSessions = [...userData.studySessions];
    updatedSessions[index] = updatedSession;
    
    const updatedUserData = {
      ...userData,
      studySessions: updatedSessions
    };
    
    // Also add the day to study days if it doesn't exist
    if (!updatedUserData.studyDays.includes(session.date)) {
      updatedUserData.studyDays = [...updatedUserData.studyDays, session.date].sort();
      updatedUserData.totalDaysStudied = updatedUserData.studyDays.length;
    }
    
    setUserData(updatedUserData);
    setEditingSession(null);
  };

  // Delete a study session
  const handleDeleteSession = (index: number) => {
    if (!userData || loading) return;
    
    setConfirmDialog({
      open: true,
      title: 'Delete Study Session',
      message: 'Are you sure you want to delete this study session? This action cannot be undone.',
      onConfirm: () => {
        const updatedSessions = [...userData.studySessions];
        updatedSessions.splice(index, 1);
        
        setUserData({
          ...userData,
          studySessions: updatedSessions
        });
      }
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
      fixedData.studyDays = [...new Set(fixedData.studyDays)].sort();
      
      // Fix totalDaysStudied to match studyDays length
      fixedData.totalDaysStudied = fixedData.studyDays.length;
      
      // Fix ongoing session if it's been active for more than 24 hours
      if (fixedData.ongoingSession) {
        const startTime = new Date(fixedData.ongoingSession.startTime);
        const now = new Date();
        const hoursDiff = (now.getTime() - startTime.getTime()) / (1000 * 60 * 60);
        
        if (hoursDiff > 24) {
          fixedData.ongoingSession = null;
        }
      }
      
      // Make sure all studySessions have all required fields
      fixedData.studySessions = fixedData.studySessions.map(session => {
        // Ensure the session date exists in studyDays
        if (!fixedData.studyDays.includes(session.date)) {
          fixedData.studyDays.push(session.date);
        }
        
        return {
          startTime: session.startTime || new Date().toISOString(),
          endTime: session.endTime,
          duration: session.duration || 0,
          date: session.date
        };
      });
      
      // Re-sort studyDays after potential additions
      fixedData.studyDays.sort();
      fixedData.totalDaysStudied = fixedData.studyDays.length;
      
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
          <Tabs 
            value={tabValue} 
            onChange={handleTabChange} 
            variant="fullWidth" 
            sx={{ mb: 3, borderBottom: 1, borderColor: 'divider' }}
          >
            <Tab icon={<LocalFireDepartmentIcon />} label="Streaks" />
            <Tab icon={<CalendarMonthIcon />} label="Study Days" />
            <Tab icon={<TimerIcon />} label="Study Sessions" />
          </Tabs>
          
          {/* Streaks Tab */}
          {tabValue === 0 && (
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
          )}
          
          {/* Study Days Tab */}
          {tabValue === 1 && (
            <>
              <Box sx={{ mb: 3, display: 'flex', gap: 1 }}>
                <TextField
                  label="Add Study Day"
                  type="date"
                  value={newStudyDay}
                  onChange={(e) => setNewStudyDay(e.target.value)}
                  disabled={loading}
                  InputLabelProps={{ shrink: true }}
                  sx={{ flexGrow: 1 }}
                />
                <Button
                  variant="contained"
                  startIcon={<AddIcon />}
                  onClick={handleAddStudyDay}
                  disabled={loading || !newStudyDay}
                >
                  Add
                </Button>
              </Box>
              
              <Typography variant="subtitle1" gutterBottom>
                Study Days ({userData.studyDays.length})
              </Typography>
              
              <Box sx={{ maxHeight: 300, overflow: 'auto', mb: 3 }}>
                <Grid container spacing={1}>
                  {userData.studyDays.length === 0 ? (
                    <Grid item xs={12}>
                      <Typography variant="body2" color="text.secondary">
                        No study days recorded
                      </Typography>
                    </Grid>
                  ) : (
                    userData.studyDays.map((day, index) => (
                      <Grid item key={index}>
                        <Chip
                          label={day}
                          onDelete={() => handleRemoveStudyDay(day)}
                          color="primary"
                          variant="outlined"
                        />
                      </Grid>
                    ))
                  )}
                </Grid>
              </Box>
            </>
          )}
          
          {/* Study Sessions Tab */}
          {tabValue === 2 && (
            <>
              <Accordion sx={{ mb: 3 }}>
                <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                  <Typography>Add New Study Session</Typography>
                </AccordionSummary>
                <AccordionDetails>
                  <Grid container spacing={2}>
                    <Grid item xs={12} sm={6}>
                      <TextField
                        label="Date"
                        type="date"
                        fullWidth
                        value={newSession.date}
                        onChange={(e) => setNewSession({...newSession, date: e.target.value})}
                        disabled={loading}
                        InputLabelProps={{ shrink: true }}
                      />
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <TextField
                        label="Start Time"
                        type="datetime-local"
                        fullWidth
                        value={newSession.startTime}
                        onChange={(e) => setNewSession({...newSession, startTime: e.target.value})}
                        disabled={loading}
                        InputLabelProps={{ shrink: true }}
                      />
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <TextField
                        label="End Time"
                        type="datetime-local"
                        fullWidth
                        value={newSession.endTime || ''}
                        onChange={(e) => setNewSession({...newSession, endTime: e.target.value || null})}
                        disabled={loading}
                        InputLabelProps={{ shrink: true }}
                      />
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <Button
                        variant="contained"
                        fullWidth
                        sx={{ height: '100%' }}
                        onClick={handleAddSession}
                        disabled={loading || !newSession.date || !newSession.startTime}
                      >
                        Add Session
                      </Button>
                    </Grid>
                  </Grid>
                </AccordionDetails>
              </Accordion>
              
              <Typography variant="subtitle1" gutterBottom>
                Study Sessions ({userData.studySessions.length})
              </Typography>
              
              <TableContainer sx={{ maxHeight: 400, mb: 3 }}>
                <Table stickyHeader size="small">
                  <TableHead>
                    <TableRow>
                      <TableCell>Date</TableCell>
                      <TableCell>Start Time</TableCell>
                      <TableCell>End Time</TableCell>
                      <TableCell>Duration</TableCell>
                      <TableCell>Actions</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {userData.studySessions.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={5} align="center">
                          No study sessions recorded
                        </TableCell>
                      </TableRow>
                    ) : (
                      userData.studySessions.map((session, index) => (
                        <TableRow key={index}>
                          <TableCell>{session.date}</TableCell>
                          <TableCell>
                            {format(parseISO(session.startTime), 'yyyy-MM-dd HH:mm')}
                          </TableCell>
                          <TableCell>
                            {session.endTime 
                              ? format(parseISO(session.endTime), 'yyyy-MM-dd HH:mm') 
                              : 'Not ended'}
                          </TableCell>
                          <TableCell>
                            {Math.floor(session.duration / 60)} minutes
                          </TableCell>
                          <TableCell>
                            <IconButton 
                              size="small" 
                              onClick={() => handleEditSession(index)}
                              disabled={loading}
                            >
                              <EditIcon fontSize="small" />
                            </IconButton>
                            <IconButton 
                              size="small" 
                              onClick={() => handleDeleteSession(index)}
                              disabled={loading}
                              color="error"
                            >
                              <DeleteIcon fontSize="small" />
                            </IconButton>
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </TableContainer>
            </>
          )}
          
          <Divider sx={{ my: 3 }} />
          
          <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
            <Button 
              variant="contained" 
              color="primary"
              onClick={saveUserData}
              disabled={loading}
            >
              Save All Changes
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
      
      {/* Edit Session Dialog */}
      <Dialog 
        open={!!editingSession} 
        onClose={() => setEditingSession(null)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>Edit Study Session</DialogTitle>
        <DialogContent>
          {editingSession && (
            <Grid container spacing={2} sx={{ mt: 1 }}>
              <Grid item xs={12}>
                <TextField
                  label="Date"
                  type="date"
                  fullWidth
                  value={editingSession.session.date}
                  onChange={(e) => setEditingSession({
                    ...editingSession,
                    session: {...editingSession.session, date: e.target.value}
                  })}
                  disabled={loading}
                  InputLabelProps={{ shrink: true }}
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  label="Start Time"
                  type="datetime-local"
                  fullWidth
                  value={editingSession.session.startTime}
                  onChange={(e) => setEditingSession({
                    ...editingSession,
                    session: {...editingSession.session, startTime: e.target.value}
                  })}
                  disabled={loading}
                  InputLabelProps={{ shrink: true }}
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  label="End Time"
                  type="datetime-local"
                  fullWidth
                  value={editingSession.session.endTime || ''}
                  onChange={(e) => setEditingSession({
                    ...editingSession,
                    session: {...editingSession.session, endTime: e.target.value || null}
                  })}
                  disabled={loading}
                  InputLabelProps={{ shrink: true }}
                />
              </Grid>
            </Grid>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setEditingSession(null)}>Cancel</Button>
          <Button 
            onClick={handleSaveSession} 
            variant="contained" 
            disabled={loading}
          >
            Save
          </Button>
        </DialogActions>
      </Dialog>
      
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