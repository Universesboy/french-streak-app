import React from 'react';
import { 
  Button, 
  Box, 
  Typography, 
  Paper,
  useTheme
} from '@mui/material';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import { format } from 'date-fns';

interface CheckInButtonProps {
  onCheckIn: () => void;
  disabled: boolean;
  lastCheckIn: string | null;
}

const CheckInButton: React.FC<CheckInButtonProps> = ({ 
  onCheckIn, 
  disabled, 
  lastCheckIn 
}) => {
  const theme = useTheme();
  
  // Format the last check-in date for display
  const formattedLastCheckIn = lastCheckIn 
    ? format(new Date(lastCheckIn), 'MMMM d, yyyy')
    : null;
  
  return (
    <Paper 
      elevation={2} 
      sx={{ 
        p: 3, 
        borderRadius: 3,
        textAlign: 'center',
        backgroundColor: theme.palette.background.paper,
        border: '1px solid',
        borderColor: disabled ? 'success.light' : 'divider',
      }}
    >
      <Typography variant="h6" component="h2" gutterBottom>
        {disabled 
          ? "You've checked in today!" 
          : 'Ready to learn French today?'}
      </Typography>
      
      <Typography 
        variant="body1" 
        color="text.secondary" 
        sx={{ mb: 3 }}
      >
        {disabled 
          ? `Last check-in: ${formattedLastCheckIn}` 
          : 'Check in to maintain your streak and earn rewards'}
      </Typography>
      
      <Box sx={{ display: 'flex', justifyContent: 'center' }}>
        <Button
          variant="contained"
          color={disabled ? "success" : "primary"}
          size="large"
          onClick={onCheckIn}
          disabled={disabled}
          startIcon={disabled ? <CheckCircleIcon /> : null}
          sx={{ 
            px: 4, 
            py: 1.5,
            borderRadius: 2,
            fontWeight: 'bold',
            fontSize: '1rem',
          }}
        >
          {disabled ? 'Checked In' : 'Check In Now'}
        </Button>
      </Box>
    </Paper>
  );
};

export default CheckInButton; 