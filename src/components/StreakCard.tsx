import React from 'react';
import { 
  Paper, 
  Box, 
  Typography, 
  Grid,
  useTheme,
  Card,
  CardContent,
  LinearProgress,
  Divider,
  Tooltip
} from '@mui/material';
import LocalFireDepartmentIcon from '@mui/icons-material/LocalFireDepartment';
import EmojiEventsIcon from '@mui/icons-material/EmojiEvents';
import CalendarMonthIcon from '@mui/icons-material/CalendarMonth';
import AttachMoneyIcon from '@mui/icons-material/AttachMoney';
import { motion } from 'framer-motion';

interface StreakCardProps {
  currentStreak: number;
  longestStreak: number;
  totalDaysStudied: number;
  totalReward: number;
}

const StreakCard: React.FC<StreakCardProps> = ({ 
  currentStreak, 
  longestStreak, 
  totalDaysStudied, 
  totalReward 
}) => {
  const theme = useTheme();
  
  // Calculate progress percentage
  const progressPercentage = longestStreak > 0 
    ? Math.min((currentStreak / longestStreak) * 100, 100) 
    : 100;
  
  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { 
      opacity: 1,
      transition: { 
        when: "beforeChildren",
        staggerChildren: 0.1
      }
    }
  };

  const cardVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { 
      opacity: 1, 
      y: 0,
      transition: { duration: 0.3 }
    },
    hover: {
      y: -8,
      boxShadow: '0 12px 20px rgba(0, 0, 0, 0.1)',
      transition: { duration: 0.2 }
    }
  };

  const iconVariants = {
    hidden: { scale: 0, rotate: -180 },
    visible: {
      scale: 1,
      rotate: 0,
      transition: {
        type: "spring",
        stiffness: 260,
        damping: 20
      }
    }
  };

  const stats = [
    {
      label: 'Current Streak',
      value: currentStreak,
      icon: <LocalFireDepartmentIcon />,
      color: theme.palette.secondary.main,
      suffix: currentStreak === 1 ? 'day' : 'days',
      description: 'Your current consecutive days studying French'
    },
    {
      label: 'Longest Streak',
      value: longestStreak,
      icon: <EmojiEventsIcon />,
      color: theme.palette.warning.main,
      suffix: longestStreak === 1 ? 'day' : 'days',
      description: 'Your longest streak of consecutive study days'
    },
    {
      label: 'Total Days',
      value: totalDaysStudied,
      icon: <CalendarMonthIcon />,
      color: theme.palette.primary.main,
      suffix: totalDaysStudied === 1 ? 'day' : 'days',
      description: 'Total number of days you have studied French'
    },
    {
      label: 'Total Reward',
      value: totalReward,
      icon: <AttachMoneyIcon />,
      color: theme.palette.success.main,
      prefix: '$',
      description: 'Total rewards earned from your study streaks'
    }
  ];
  
  return (
    <motion.div
      initial="hidden"
      animate="visible"
      variants={containerVariants}
    >
      <Paper 
        elevation={2} 
        sx={{ 
          p: { xs: 2, sm: 3 }, 
          borderRadius: 3,
          backgroundColor: 'rgba(255, 255, 255, 0.9)',
          backdropFilter: 'blur(10px)',
          mb: 4
        }}
      >
        <Box sx={{ mb: 3, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <Typography 
            variant="h5" 
            component="h2" 
            sx={{ 
              fontWeight: 'bold',
              display: 'flex',
              alignItems: 'center'
            }}
          >
            <motion.div variants={iconVariants}>
              <EmojiEventsIcon 
                sx={{ 
                  mr: 1.5, 
                  color: theme.palette.primary.main,
                  fontSize: 28
                }} 
              />
            </motion.div>
            Your Progress Stats
          </Typography>
          
          {currentStreak > 0 && (
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
              <Box sx={{ width: 120, mr: 2 }}>
                <Typography variant="caption" color="text.secondary" sx={{ mb: 0.5, display: 'block' }}>
                  Streak Progress
                </Typography>
                <LinearProgress 
                  variant="determinate" 
                  value={progressPercentage} 
                  sx={{ 
                    height: 8, 
                    borderRadius: 4,
                    backgroundColor: 'rgba(0, 0, 0, 0.05)',
                    '& .MuiLinearProgress-bar': {
                      borderRadius: 4,
                      background: `linear-gradient(90deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`
                    }
                  }} 
                />
              </Box>
              <Typography 
                variant="body2" 
                color="text.secondary" 
                sx={{ fontWeight: 'medium' }}
              >
                {Math.round(progressPercentage)}%
              </Typography>
            </Box>
          )}
        </Box>
        
        <Divider sx={{ mb: 3 }} />
        
        <Grid container spacing={2}>
          {stats.map((stat, index) => (
            <Grid item xs={6} sm={3} key={index}>
              <motion.div
                variants={cardVariants}
                whileHover="hover"
              >
                <Tooltip 
                  title={stat.description} 
                  arrow 
                  placement="top"
                >
                  <Card 
                    sx={{ 
                      boxShadow: '0 4px 12px rgba(0, 0, 0, 0.05)',
                      height: '100%',
                      transition: 'all 0.3s ease',
                      position: 'relative',
                      overflow: 'hidden',
                      '&:before': {
                        content: '""',
                        position: 'absolute',
                        top: 0,
                        left: 0,
                        width: '100%',
                        height: '4px',
                        backgroundColor: stat.color
                      }
                    }}
                  >
                    <CardContent sx={{ p: 2, '&:last-child': { pb: 2 } }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                        <Box 
                          sx={{ 
                            mr: 1, 
                            display: 'flex', 
                            alignItems: 'center', 
                            justifyContent: 'center',
                            width: 34,
                            height: 34,
                            borderRadius: '50%',
                            backgroundColor: `${stat.color}15`,
                            color: stat.color
                          }}
                        >
                          {stat.icon}
                        </Box>
                        <Typography 
                          variant="subtitle2" 
                          color="text.secondary"
                          sx={{ fontSize: '0.75rem', lineHeight: 1 }}
                        >
                          {stat.label}
                        </Typography>
                      </Box>
                      
                      <Typography 
                        variant="h5" 
                        component="div" 
                        sx={{ 
                          fontWeight: 'bold',
                          color: theme.palette.text.primary
                        }}
                      >
                        {stat.prefix}{stat.value !== undefined ? stat.value.toLocaleString() : '0'}
                      </Typography>
                      
                      {stat.suffix && (
                        <Typography 
                          variant="caption" 
                          color="text.secondary"
                          sx={{ 
                            display: 'block',
                            mt: 0.5
                          }}
                        >
                          {stat.suffix}
                        </Typography>
                      )}
                    </CardContent>
                  </Card>
                </Tooltip>
              </motion.div>
            </Grid>
          ))}
        </Grid>
      </Paper>
    </motion.div>
  );
};

export default StreakCard; 