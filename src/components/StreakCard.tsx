import React from 'react';
import { 
  Paper, 
  Box, 
  Typography, 
  Grid,
  useTheme
} from '@mui/material';
import LocalFireDepartmentIcon from '@mui/icons-material/LocalFireDepartment';
import EmojiEventsIcon from '@mui/icons-material/EmojiEvents';
import CalendarMonthIcon from '@mui/icons-material/CalendarMonth';
import AttachMoneyIcon from '@mui/icons-material/AttachMoney';

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
  
  const stats = [
    {
      label: 'Current Streak',
      value: currentStreak,
      icon: <LocalFireDepartmentIcon sx={{ color: theme.palette.secondary.main }} />,
      suffix: currentStreak === 1 ? 'day' : 'days'
    },
    {
      label: 'Longest Streak',
      value: longestStreak,
      icon: <EmojiEventsIcon sx={{ color: theme.palette.secondary.dark }} />,
      suffix: longestStreak === 1 ? 'day' : 'days'
    },
    {
      label: 'Total Days',
      value: totalDaysStudied,
      icon: <CalendarMonthIcon sx={{ color: theme.palette.primary.main }} />,
      suffix: totalDaysStudied === 1 ? 'day' : 'days'
    },
    {
      label: 'Total Reward',
      value: totalReward,
      icon: <AttachMoneyIcon sx={{ color: theme.palette.success.main }} />,
      prefix: '$'
    }
  ];
  
  return (
    <Paper 
      elevation={2} 
      sx={{ 
        p: 3, 
        borderRadius: 3,
        backgroundColor: theme.palette.background.paper
      }}
    >
      <Typography 
        variant="h5" 
        component="h2" 
        gutterBottom 
        sx={{ 
          fontWeight: 'bold',
          textAlign: 'center',
          mb: 3
        }}
      >
        Your French Learning Stats
      </Typography>
      
      <Grid container spacing={3}>
        {stats.map((stat, index) => (
          <Grid item xs={6} sm={3} key={index}>
            <Box 
              sx={{ 
                display: 'flex', 
                flexDirection: 'column', 
                alignItems: 'center',
                textAlign: 'center'
              }}
            >
              <Box 
                sx={{ 
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  mb: 1
                }}
              >
                {stat.icon}
                <Typography 
                  variant="h5" 
                  component="div" 
                  sx={{ 
                    fontWeight: 'bold',
                    ml: 0.5
                  }}
                >
                  {stat.prefix}{stat.value}
                </Typography>
                {stat.suffix && (
                  <Typography 
                    variant="body2" 
                    component="span" 
                    sx={{ 
                      ml: 0.5,
                      alignSelf: 'flex-end',
                      mb: 0.5
                    }}
                  >
                    {stat.suffix}
                  </Typography>
                )}
              </Box>
              <Typography 
                variant="body2" 
                color="text.secondary"
              >
                {stat.label}
              </Typography>
            </Box>
          </Grid>
        ))}
      </Grid>
    </Paper>
  );
};

export default StreakCard; 