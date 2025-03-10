import React, { useState } from 'react';
import { 
  Box, 
  Button, 
  Typography, 
  Paper, 
  Container,
  Avatar,
  Divider,
  Tabs,
  Tab
} from '@mui/material';
import { logoutUser } from '../utils/firebase';
import { useAuth } from '../utils/AuthContext';
import PersonIcon from '@mui/icons-material/Person';
import SettingsIcon from '@mui/icons-material/Settings';
import BackupIcon from '@mui/icons-material/Backup';
import UserDataManager from './UserDataManager';
import UserDataExportImport from './UserDataExportImport';
import AdminDataManager from './AdminDataManager';

interface UserProfileProps {
  onLogout: () => void;
  onDataUpdate?: () => void;
}

const UserProfile: React.FC<UserProfileProps> = ({ onLogout, onDataUpdate }) => {
  const { currentUser } = useAuth();
  const [loading, setLoading] = useState(false);
  const [tabValue, setTabValue] = useState(0);

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };

  const handleLogout = async () => {
    setLoading(true);
    try {
      const { error } = await logoutUser();
      if (!error) {
        onLogout();
      } else {
        console.error('Logout error:', error);
      }
    } catch (err) {
      console.error('Unexpected error during logout:', err);
    } finally {
      setLoading(false);
    }
  };
  
  // Function to refresh data in parent components if needed
  const handleDataUpdated = () => {
    // This can be expanded to trigger a refresh in the parent component
    console.log('User data has been updated');
    if (onDataUpdate) {
      onDataUpdate();
    }
  };

  // Simple check for admin privileges (can be replaced with actual role check)
  const isAdmin = currentUser?.email === 'admin@example.com';

  return (
    <Container maxWidth="md">
      <Paper elevation={3} sx={{ p: 4, mt: 4 }}>
        <Box display="flex" flexDirection="column" alignItems="center">
          <Avatar sx={{ width: 80, height: 80, mb: 2, bgcolor: 'primary.main' }}>
            <PersonIcon fontSize="large" />
          </Avatar>
          
          <Typography variant="h5" component="h2" gutterBottom>
            User Profile
          </Typography>
          
          <Divider sx={{ width: '100%', my: 2 }} />
          
          <Box sx={{ width: '100%', mb: 2 }}>
            <Typography variant="subtitle1" color="text.secondary">
              Email
            </Typography>
            <Typography variant="body1">
              {currentUser?.email}
            </Typography>
          </Box>
          
          <Box sx={{ width: '100%', mb: 3 }}>
            <Typography variant="subtitle1" color="text.secondary">
              Account ID
            </Typography>
            <Typography variant="body1" sx={{ wordBreak: 'break-all' }}>
              {currentUser?.uid}
            </Typography>
          </Box>
          
          <Button
            variant="outlined"
            color="primary"
            onClick={handleLogout}
            disabled={loading}
            fullWidth
            sx={{ mb: 4 }}
          >
            {loading ? 'Logging out...' : 'Log Out'}
          </Button>
          
          {/* Data Management Tabs */}
          <Box sx={{ width: '100%' }}>
            <Tabs 
              value={tabValue} 
              onChange={handleTabChange} 
              centered
              indicatorColor="primary"
              textColor="primary"
              sx={{ mb: 3 }}
            >
              <Tab icon={<SettingsIcon />} label="Manage Data" />
              <Tab icon={<BackupIcon />} label="Export/Import" />
              {isAdmin && <Tab label="Admin Tools" />}
            </Tabs>
            
            {tabValue === 0 && (
              <UserDataManager onDataUpdated={handleDataUpdated} />
            )}
            
            {tabValue === 1 && (
              <UserDataExportImport onDataUpdated={handleDataUpdated} />
            )}
            
            {tabValue === 2 && isAdmin && (
              <AdminDataManager onDataUpdated={handleDataUpdated} />
            )}
          </Box>
        </Box>
      </Paper>
    </Container>
  );
};

export default UserProfile; 