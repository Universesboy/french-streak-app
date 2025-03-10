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
  List,
  ListItem,
  ListItemText,
  Divider,
  CircularProgress
} from '@mui/material';
import { useAuth } from '../utils/AuthContext';
import { 
  fixAllUsersDataIssues, 
  batchUpdateUsers 
} from '../utils/userDataUtils';
import { db } from '../utils/firebase';
import { collection, query, getDocs } from 'firebase/firestore';
import { StreakData } from '../utils/streakUtils';

interface AdminDataManagerProps {
  onDataUpdated?: () => void;
}

const AdminDataManager: React.FC<AdminDataManagerProps> = ({ onDataUpdated }) => {
  const { currentUser } = useAuth();
  const [loading, setLoading] = useState(false);
  const [users, setUsers] = useState<{id: string, email: string}[]>([]);
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
  const [batchUpdateCriteria, setBatchUpdateCriteria] = useState('');
  const [batchUpdateValue, setBatchUpdateValue] = useState('');

  // Load all users
  const loadUsers = async () => {
    if (!currentUser) {
      setNotification({
        open: true,
        message: 'You must be logged in as an admin to manage user data',
        severity: 'warning'
      });
      return;
    }

    setLoading(true);
    try {
      const usersRef = collection(db, "users");
      const usersSnapshot = await getDocs(query(usersRef));
      
      const usersList: {id: string, email: string}[] = [];
      
      usersSnapshot.forEach((doc) => {
        const userData = doc.data();
        usersList.push({
          id: doc.id,
          email: userData.email || 'No email'
        });
      });
      
      setUsers(usersList);
    } catch (error) {
      console.error('Error loading users:', error);
      setNotification({
        open: true,
        message: 'Failed to load users',
        severity: 'error'
      });
    } finally {
      setLoading(false);
    }
  };

  // Fix all users' data issues
  const handleFixAllUsersData = () => {
    setConfirmDialog({
      open: true,
      title: 'Fix All Users Data',
      message: 'Are you sure you want to fix data issues for all users? This will correct negative values, remove duplicate study days, and fix stuck ongoing sessions.',
      onConfirm: async () => {
        setLoading(true);
        try {
          const result = await fixAllUsersDataIssues();
          
          if ('updatedCount' in result && result.updatedCount !== undefined) {
            setNotification({
              open: true,
              message: `Fixed data issues for ${result.updatedCount} users`,
              severity: 'success'
            });
          } else {
            throw new Error('Operation failed');
          }
          
          if (onDataUpdated) onDataUpdated();
        } catch (error) {
          console.error('Error fixing all users data:', error);
          setNotification({
            open: true,
            message: 'Failed to fix all users data',
            severity: 'error'
          });
        } finally {
          setLoading(false);
        }
      }
    });
  };

  // Batch update users based on criteria
  const handleBatchUpdate = () => {
    // Validate inputs
    if (!batchUpdateCriteria || !batchUpdateValue) {
      setNotification({
        open: true,
        message: 'Please provide both criteria and update value',
        severity: 'warning'
      });
      return;
    }

    setConfirmDialog({
      open: true,
      title: 'Batch Update Users',
      message: `Are you sure you want to update all users matching the criteria: "${batchUpdateCriteria}"?`,
      onConfirm: async () => {
        setLoading(true);
        try {
          // Parse the criteria and update value as JavaScript functions
          // Note: This is potentially dangerous and should be used with caution
          // In a production app, you'd want to use a safer approach
          const criteriaFn = new Function('data', `return ${batchUpdateCriteria}`);
          const updateFn = new Function('data', `return ${batchUpdateValue}`);
          
          const result = await batchUpdateUsers(
            (userData) => {
              try {
                return criteriaFn(userData);
              } catch (e) {
                console.error('Error evaluating criteria:', e);
                return false;
              }
            },
            (streakData) => {
              try {
                return updateFn(streakData);
              } catch (e) {
                console.error('Error applying update:', e);
                return {};
              }
            }
          );
          
          setNotification({
            open: true,
            message: `Updated ${result.updatedCount} users`,
            severity: 'success'
          });
          
          if (onDataUpdated) onDataUpdated();
        } catch (error) {
          console.error('Error batch updating users:', error);
          setNotification({
            open: true,
            message: 'Failed to batch update users',
            severity: 'error'
          });
        } finally {
          setLoading(false);
        }
      }
    });
  };

  return (
    <Paper elevation={3} sx={{ p: 3, mb: 3 }}>
      <Typography variant="h5" gutterBottom>
        Admin Data Manager
      </Typography>
      
      <Box sx={{ mb: 3 }}>
        <Button 
          variant="contained" 
          onClick={loadUsers} 
          disabled={loading}
          sx={{ mr: 2, mb: 2 }}
        >
          Load All Users
        </Button>
        
        <Button 
          variant="outlined" 
          color="secondary"
          onClick={handleFixAllUsersData}
          disabled={loading}
          sx={{ mr: 2, mb: 2 }}
        >
          Fix All Users Data
        </Button>
      </Box>
      
      <Typography variant="h6" gutterBottom>
        Batch Update Users
      </Typography>
      
      <Grid container spacing={2} sx={{ mb: 3 }}>
        <Grid item xs={12}>
          <TextField
            label="Criteria (JavaScript expression)"
            fullWidth
            multiline
            rows={2}
            value={batchUpdateCriteria}
            onChange={(e) => setBatchUpdateCriteria(e.target.value)}
            disabled={loading}
            placeholder="data.streakData.currentStreak > 10"
            helperText="JavaScript expression that returns true/false. 'data' is the user document."
          />
        </Grid>
        <Grid item xs={12}>
          <TextField
            label="Update (JavaScript expression)"
            fullWidth
            multiline
            rows={2}
            value={batchUpdateValue}
            onChange={(e) => setBatchUpdateValue(e.target.value)}
            disabled={loading}
            placeholder="{ currentStreak: data.currentStreak + 1 }"
            helperText="JavaScript expression that returns an object with fields to update. 'data' is the streak data."
          />
        </Grid>
        <Grid item xs={12}>
          <Button 
            variant="contained" 
            color="primary"
            onClick={handleBatchUpdate}
            disabled={loading || !batchUpdateCriteria || !batchUpdateValue}
          >
            Apply Batch Update
          </Button>
        </Grid>
      </Grid>
      
      {users.length > 0 && (
        <>
          <Typography variant="h6" gutterBottom>
            Users ({users.length})
          </Typography>
          
          <List sx={{ maxHeight: 300, overflow: 'auto', bgcolor: 'background.paper' }}>
            {users.map((user, index) => (
              <React.Fragment key={user.id}>
                <ListItem>
                  <ListItemText 
                    primary={user.email} 
                    secondary={`ID: ${user.id}`} 
                  />
                </ListItem>
                {index < users.length - 1 && <Divider />}
              </React.Fragment>
            ))}
          </List>
        </>
      )}
      
      {loading && (
        <Box sx={{ display: 'flex', justifyContent: 'center', mt: 2 }}>
          <CircularProgress />
        </Box>
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

export default AdminDataManager;