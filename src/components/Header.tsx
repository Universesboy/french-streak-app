import React from 'react';
import { 
  Box, 
  Typography, 
  AppBar, 
  Toolbar,
  useTheme,
  useMediaQuery,
  IconButton,
  Button,
  Chip,
  Container,
  Avatar
} from '@mui/material';
import LocalFireDepartmentIcon from '@mui/icons-material/LocalFireDepartment';
import LoginIcon from '@mui/icons-material/Login';
import PersonAddIcon from '@mui/icons-material/PersonAdd';
import { motion } from 'framer-motion';

interface HeaderProps {
  streakCount: number;
  isLoggedIn: boolean;
  onLoginClick: () => void;
  onRegisterClick: () => void;
}

const Header: React.FC<HeaderProps> = ({ 
  streakCount, 
  isLoggedIn, 
  onLoginClick, 
  onRegisterClick 
}) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  // Animation variants
  const logoVariants = {
    hidden: { opacity: 0, y: -10 },
    visible: { 
      opacity: 1, 
      y: 0,
      transition: { 
        duration: 0.4 
      }
    }
  };

  const buttonVariants = {
    hidden: { opacity: 0, y: -10 },
    visible: { 
      opacity: 1, 
      y: 0,
      transition: { 
        duration: 0.3, 
        delay: 0.2 
      }
    }
  };

  const streakVariants = {
    hidden: { scale: 0.8, opacity: 0 },
    visible: { 
      scale: 1, 
      opacity: 1,
      transition: { 
        type: "spring",
        stiffness: 300,
        damping: 15,
        delay: 0.1
      }
    }
  };

  return (
    <AppBar 
      position="sticky" 
      elevation={0}
      sx={{ 
        backgroundColor: 'rgba(255, 255, 255, 0.95)',
        backdropFilter: 'blur(10px)',
        borderBottom: '1px solid',
        borderColor: 'divider',
      }}
    >
      <Container maxWidth="lg">
        <Toolbar sx={{ py: 1.5 }}>
          <motion.div
            initial="hidden"
            animate="visible"
            variants={logoVariants}
          >
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
              <Avatar 
                sx={{ 
                  backgroundColor: theme.palette.primary.main,
                  width: { xs: 40, sm: 48 },
                  height: { xs: 40, sm: 48 },
                  mr: 1.5
                }}
              >
                <LocalFireDepartmentIcon 
                  sx={{ 
                    color: 'white',
                    fontSize: { xs: 24, sm: 28 }
                  }} 
                />
              </Avatar>
              <Box>
                <Typography 
                  variant={isMobile ? "h6" : "h5"} 
                  component="h1" 
                  sx={{ 
                    fontWeight: 700,
                    color: theme.palette.primary.main,
                    lineHeight: 1.2
                  }}
                >
                  French Streak
                </Typography>
                <Typography 
                  variant="caption" 
                  sx={{ 
                    display: { xs: 'none', sm: 'block' },
                    color: theme.palette.text.secondary
                  }}
                >
                  Track your learning progress
                </Typography>
              </Box>
            </Box>
          </motion.div>
          
          <Box sx={{ flexGrow: 1 }} />
          
          {streakCount > 0 && (
            <motion.div
              initial="hidden"
              animate="visible"
              variants={streakVariants}
            >
              <Chip
                avatar={<LocalFireDepartmentIcon style={{ color: '#FF6B6B' }} />}
                label={`${streakCount} day${streakCount !== 1 ? 's' : ''}`}
                sx={{ 
                  mr: 2,
                  fontWeight: 'bold',
                  backgroundColor: 'rgba(255, 107, 107, 0.1)',
                  color: theme.palette.secondary.dark,
                  border: '1px solid',
                  borderColor: 'rgba(255, 107, 107, 0.3)',
                  boxShadow: '0 2px 8px rgba(255, 107, 107, 0.15)',
                  '& .MuiChip-avatar': { 
                    backgroundColor: 'transparent' 
                  }
                }}
              />
            </motion.div>
          )}
          
          {!isLoggedIn ? (
            <motion.div
              initial="hidden"
              animate="visible"
              variants={buttonVariants}
            >
              {isMobile ? (
                <>
                  <IconButton 
                    onClick={onLoginClick}
                    sx={{ 
                      ml: 1,
                      color: theme.palette.primary.main
                    }}
                  >
                    <LoginIcon />
                  </IconButton>
                  <IconButton 
                    onClick={onRegisterClick}
                    sx={{ 
                      ml: 1,
                      color: theme.palette.secondary.main
                    }}
                  >
                    <PersonAddIcon />
                  </IconButton>
                </>
              ) : (
                <>
                  <Button 
                    variant="outlined"
                    color="primary" 
                    onClick={onLoginClick}
                    startIcon={<LoginIcon />}
                    sx={{ ml: 1 }}
                  >
                    Log In
                  </Button>
                  <Button 
                    variant="contained" 
                    color="primary" 
                    onClick={onRegisterClick}
                    startIcon={<PersonAddIcon />}
                    sx={{ ml: 2 }}
                  >
                    Sign Up
                  </Button>
                </>
              )}
            </motion.div>
          ) : null}
        </Toolbar>
      </Container>
    </AppBar>
  );
};

export default Header; 