import React from 'react';
import { 
  Button, 
  Box, 
  Typography, 
  Paper,
  useTheme,
  Divider,
  Chip
} from '@mui/material';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import EmojiEventsIcon from '@mui/icons-material/EmojiEvents';
import SchoolIcon from '@mui/icons-material/School';
import { format } from 'date-fns';
import { motion } from 'framer-motion';

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
  
  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { 
      opacity: 1, 
      y: 0,
      transition: {
        duration: 0.5,
        when: "beforeChildren",
        staggerChildren: 0.1
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 10 },
    visible: { 
      opacity: 1, 
      y: 0,
      transition: { duration: 0.3 }
    }
  };

  const buttonVariants = {
    hidden: { opacity: 0, scale: 0.8 },
    visible: { 
      opacity: 1, 
      scale: 1,
      transition: { 
        type: "spring",
        stiffness: 200,
        damping: 15,
        delay: 0.3
      }
    },
    tap: {
      scale: 0.95,
      transition: { duration: 0.1 }
    },
    hover: {
      scale: 1.05,
      boxShadow: '0 8px 16px rgba(0, 0, 0, 0.15)',
      transition: { duration: 0.2 }
    }
  };
  
  return (
    <motion.div
      initial="hidden"
      animate="visible"
      variants={containerVariants}
    >
      <Paper 
        elevation={2} 
        sx={{ 
          p: { xs: 3, md: 4 }, 
          borderRadius: 3,
          overflow: 'hidden',
          backgroundImage: disabled ? 
            'linear-gradient(135deg, rgba(76, 175, 80, 0.05) 0%, rgba(76, 175, 80, 0.1) 100%)' : 
            'linear-gradient(135deg, rgba(67, 97, 238, 0.05) 0%, rgba(67, 97, 238, 0.1) 100%)',
          position: 'relative'
        }}
      >
        {/* Decorative elements */}
        <Box 
          sx={{ 
            position: 'absolute', 
            top: -30, 
            right: -30, 
            width: 120, 
            height: 120, 
            borderRadius: '50%', 
            backgroundColor: disabled ? 'success.light' : 'primary.light',
            opacity: 0.1
          }} 
        />
        <Box 
          sx={{ 
            position: 'absolute', 
            bottom: -20, 
            left: -20, 
            width: 80, 
            height: 80, 
            borderRadius: '50%', 
            backgroundColor: disabled ? 'success.main' : 'primary.main',
            opacity: 0.1
          }} 
        />
        
        <motion.div variants={itemVariants}>
          {disabled ? (
            <Chip 
              icon={<CheckCircleIcon />} 
              label="Checked In Today" 
              color="success" 
              variant="filled"
              sx={{ mb: 2 }}
            />
          ) : (
            <Chip 
              icon={<SchoolIcon />} 
              label="Ready to Study?" 
              color="primary" 
              variant="outlined" 
              sx={{ mb: 2 }}
            />
          )}
        </motion.div>
        
        <motion.div variants={itemVariants}>
          <Typography variant="h5" component="h2" gutterBottom>
            {disabled 
              ? "You've completed your French studies today!" 
              : 'Track your French learning streak'}
          </Typography>
        </motion.div>
        
        <motion.div variants={itemVariants}>
          <Typography 
            variant="body1" 
            color="text.secondary" 
            sx={{ mb: 3 }}
          >
            {disabled 
              ? `Last check-in: ${formattedLastCheckIn}` 
              : 'Check in daily to build your streak and track your progress. Consistent practice is key to language mastery!'}
          </Typography>
        </motion.div>
        
        <Divider sx={{ my: 3 }} />
        
        <Box sx={{ display: 'flex', justifyContent: 'center' }}>
          <motion.div
            variants={buttonVariants}
            whileTap="tap"
            whileHover="hover"
          >
            <Button
              variant="contained"
              color={disabled ? "success" : "primary"}
              size="large"
              onClick={onCheckIn}
              disabled={disabled}
              startIcon={disabled ? <CheckCircleIcon /> : <EmojiEventsIcon />}
              sx={{ 
                px: 5, 
                py: 1.5,
                borderRadius: 3,
                fontWeight: 'bold',
                fontSize: '1.1rem',
                boxShadow: '0 4px 12px rgba(0, 0, 0, 0.12)'
              }}
            >
              {disabled ? 'Already Checked In' : 'Check In Now'}
            </Button>
          </motion.div>
        </Box>
        
        {disabled && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
          >
            <Box sx={{ mt: 3, textAlign: 'center' }}>
              <Typography variant="body2" color="success.dark">
                <EmojiEventsIcon sx={{ fontSize: 16, mr: 0.5, verticalAlign: 'text-bottom' }} />
                Come back tomorrow to continue your streak!
              </Typography>
            </Box>
          </motion.div>
        )}
      </Paper>
    </motion.div>
  );
};

export default CheckInButton; 