import React from 'react';
import { 
  Box, 
  Button, 
  Typography, 
  Paper, 
  Container,
  Avatar,
  Divider
} from '@mui/material';
import { logoutUser } from '../utils/firebase';
import { useAuth } from '../utils/AuthContext';
import PersonIcon from '@mui/icons-material/Person';

interface UserProfileProps {
  onLogout: () => void;
}

const UserProfile: React.FC<UserProfileProps> = ({ onLogout }) => {
  const { currentUser } = useAuth();
  const [loading, setLoading] = React.useState(false);

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

  return (
    <Container maxWidth="sm">
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
          >
            {loading ? 'Logging out...' : 'Log Out'}
          </Button>
        </Box>
      </Paper>
    </Container>
  );
};

export default UserProfile; 