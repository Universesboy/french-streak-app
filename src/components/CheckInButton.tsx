import React from 'react';
import { 
  Button, 
  Box, 
  Typography, 
  Tooltip,
  CircularProgress,
  styled,
  Alert
} from '@mui/material';
import DoneIcon from '@mui/icons-material/Done';
import SchoolIcon from '@mui/icons-material/School';
import ChatIcon from '@mui/icons-material/Chat';
import { format } from 'date-fns';

interface CheckInButtonProps {
  onCheckIn: () => void;
  canCheckIn: boolean;
  lastCheckInDate: string | null;
}

const StyledButton = styled(Button)(({ theme }) => ({
  padding: '12px 24px',
  fontSize: '1.2rem',
  borderRadius: 30,
  transition: 'transform 0.2s, box-shadow 0.2s',
  '&:not(:disabled):hover': {
    transform: 'translateY(-2px)',
    boxShadow: '0 6px 20px rgba(76, 175, 80, 0.3)',
  },
}));

const CheckInButton: React.FC<CheckInButtonProps> = ({ 
  onCheckIn, 
  canCheckIn,
  lastCheckInDate
}) => {
  // Format the last check-in date for display
  const formattedLastCheckIn = lastCheckInDate 
    ? format(new Date(lastCheckInDate), 'MMMM d, yyyy') 
    : 'Never';

  return (
    <Box sx={{ 
      display: 'flex', 
      flexDirection: 'column', 
      alignItems: 'center',
      mt: 4 
    }}>
      <Tooltip 
        title={canCheckIn ? "Mark today's French study as complete" : "You already checked in today"}
        arrow
      >
        <span> {/* Wrapper needed for disabled button tooltips */}
          <StyledButton
            onClick={onCheckIn}
            disabled={!canCheckIn}
            variant="contained"
            color="primary"
            size="large"
            startIcon={canCheckIn ? <SchoolIcon /> : <DoneIcon />}
            endIcon={canCheckIn ? null : <DoneIcon />}
            sx={{
              mb: 2,
              backgroundColor: canCheckIn ? undefined : '#4caf50',
            }}
          >
            {canCheckIn ? "I Studied French Today" : "Completed Today"}
          </StyledButton>
        </span>
      </Tooltip>
      
      <Typography variant="body2" color="text.secondary">
        Last check-in: {formattedLastCheckIn}
      </Typography>
      
      {!canCheckIn && (
        <Typography variant="body2" color="success.main" sx={{ mt: 1 }}>
          Great job! Come back tomorrow to continue your streak.
        </Typography>
      )}

      {canCheckIn && (
        <Alert 
          severity="info" 
          icon={<ChatIcon />}
          sx={{ 
            mt: 3, 
            width: '100%', 
            maxWidth: 500,
            borderRadius: 2,
            boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)'
          }}
        >
          <Typography variant="body2">
            <strong>Reminder:</strong> WeChat notifications will be sent until you check in today. Click the button above once you've completed your French studies.
          </Typography>
        </Alert>
      )}
    </Box>
  );
};

export default CheckInButton; 