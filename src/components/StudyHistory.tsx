import React, { useState } from 'react';
import { 
  Box, 
  Typography, 
  Paper, 
  Grid, 
  Card, 
  CardContent,
  Divider,
  Button,
  styled,
  useTheme,
  useMediaQuery,
  IconButton,
  Stack,
  Tooltip
} from '@mui/material';
import { 
  CalendarMonth as CalendarIcon,
  EmojiEvents as TrophyIcon,
  Insights as InsightsIcon,
  Schedule as ScheduleIcon,
  CheckCircle as CheckCircleIcon,
  ChevronLeft as ChevronLeftIcon,
  ChevronRight as ChevronRightIcon,
  Today as TodayIcon
} from '@mui/icons-material';
import { format, startOfMonth, endOfMonth, eachDayOfInterval, getDay, isWeekend, isSameDay, addMonths, subMonths } from 'date-fns';
import { getStudyStatistics } from '../utils/streakUtils';
import type { StreakData } from '../utils/streakUtils';

interface StudyHistoryProps {
  streakData: StreakData;
}

interface StyledCalendarDayProps {
  isStudyDay: boolean; 
  isWeekend: boolean;
  isCurrentMonth: boolean;
  isToday: boolean;
}

const StyledCalendarDay = styled(Box, {
  shouldForwardProp: (prop) => 
    prop !== 'isStudyDay' && 
    prop !== 'isWeekend' && 
    prop !== 'isCurrentMonth' &&
    prop !== 'isToday'
})<StyledCalendarDayProps>(({ isStudyDay, isWeekend, isCurrentMonth, isToday, theme }) => ({
  width: '34px',
  height: '34px',
  '@media (max-width: 600px)': {
    width: '28px',
    height: '28px',
    fontSize: '0.8rem',
  },
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  margin: '2px',
  borderRadius: '50%',
  cursor: 'pointer',
  fontWeight: isStudyDay ? 600 : 400,
  color: !isCurrentMonth ? theme.palette.text.disabled : 
         isStudyDay ? '#fff' : 
         isWeekend ? theme.palette.text.secondary : 
         theme.palette.text.primary,
  backgroundColor: isStudyDay ? theme.palette.primary.main : 
                  isToday ? 'rgba(33, 150, 243, 0.1)' : 
                  'transparent',
  border: isToday && !isStudyDay ? `2px solid ${theme.palette.primary.main}` : 'none',
  boxSizing: 'border-box',
  position: 'relative',
  '&:hover': {
    backgroundColor: isStudyDay ? theme.palette.primary.dark : theme.palette.action.hover,
  },
  transition: 'background-color 0.2s, transform 0.2s',
}));

const StatCard = styled(Card)(({ theme }) => ({
  height: '100%',
  boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
  transition: 'transform 0.2s, box-shadow 0.2s',
  '&:hover': {
    transform: 'translateY(-4px)',
    boxShadow: '0 6px 12px rgba(0,0,0,0.12)',
  },
}));

const NavButton = styled(IconButton)(({ theme }) => ({
  backgroundColor: theme.palette.background.paper,
  boxShadow: '0 2px 6px rgba(0,0,0,0.1)',
  '&:hover': {
    backgroundColor: theme.palette.background.paper,
    boxShadow: '0 4px 8px rgba(0,0,0,0.15)',
  }
}));

const daysOfWeek = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

const StudyHistory: React.FC<StudyHistoryProps> = ({ streakData }) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const [currentMonth, setCurrentMonth] = useState(new Date());
  
  // Get study statistics
  const statistics = getStudyStatistics(streakData);
  
  // Navigate to previous month
  const prevMonth = () => {
    setCurrentMonth(prev => subMonths(prev, 1));
  };
  
  // Navigate to next month
  const nextMonth = () => {
    setCurrentMonth(prev => addMonths(prev, 1));
  };
  
  // Reset to current month
  const resetToCurrentMonth = () => {
    setCurrentMonth(new Date());
  };
  
  // Generate days for the calendar
  const generateCalendarDays = () => {
    const monthStart = startOfMonth(currentMonth);
    const monthEnd = endOfMonth(currentMonth);
    const startDate = new Date(monthStart);
    const endDate = new Date(monthEnd);
    const today = new Date();
    
    // Adjust to start from the first day of the week (Sunday)
    startDate.setDate(1 - getDay(monthStart));
    // Adjust to end on the last day of the week
    const lastDay = getDay(monthEnd);
    endDate.setDate(endDate.getDate() + (6 - lastDay));
    
    const daysInMonth = eachDayOfInterval({ start: startDate, end: endDate });
    
    return daysInMonth.map(day => {
      const formattedDate = format(day, 'yyyy-MM-dd');
      const isStudyDay = streakData.studyDays.includes(formattedDate);
      const dayIsWeekend = isWeekend(day);
      const isCurrentMonthDay = day.getMonth() === currentMonth.getMonth();
      const isTodayDate = isSameDay(day, today);
      
      return (
        <StyledCalendarDay
          key={formattedDate}
          isStudyDay={isStudyDay}
          isWeekend={dayIsWeekend}
          isCurrentMonth={isCurrentMonthDay}
          isToday={isTodayDate}
          data-date={formattedDate}
          aria-label={`${formattedDate}: ${isStudyDay ? 'Studied' : 'Not studied'}`}
        >
          {format(day, 'd')}
          {isStudyDay && isMobile && (
            <Box 
              component="span" 
              sx={{
                position: 'absolute',
                bottom: -4,
                width: 4,
                height: 4,
                backgroundColor: theme.palette.secondary.main,
                borderRadius: '50%',
                display: { xs: 'none', sm: 'block' }
              }}
            />
          )}
        </StyledCalendarDay>
      );
    });
  };
  
  return (
    <Box sx={{ mt: 4 }}>
      <Typography variant="h5" component="h2" sx={{ 
        display: 'flex', 
        alignItems: 'center', 
        mb: 3,
        fontWeight: 'bold'
      }}>
        <CalendarIcon sx={{ mr: 1, color: theme.palette.primary.main }} />
        Your Study History
      </Typography>
      
      {/* Statistics Cards */}
      <Grid container spacing={isMobile ? 1 : 2} sx={{ mb: 4 }}>
        <Grid item xs={6} sm={6} md={3}>
          <StatCard>
            <CardContent sx={{ textAlign: 'center', p: isMobile ? 1.5 : 3 }}>
              <TrophyIcon sx={{ fontSize: isMobile ? 28 : 40, color: '#FFD700', mb: 1 }} />
              <Typography variant={isMobile ? "h6" : "h5"} component="div" sx={{ fontWeight: 'bold' }}>
                {statistics.longestStreak}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Longest Streak
              </Typography>
            </CardContent>
          </StatCard>
        </Grid>
        
        <Grid item xs={6} sm={6} md={3}>
          <StatCard>
            <CardContent sx={{ textAlign: 'center', p: isMobile ? 1.5 : 3 }}>
              <CheckCircleIcon sx={{ fontSize: isMobile ? 28 : 40, color: '#4CAF50', mb: 1 }} />
              <Typography variant={isMobile ? "h6" : "h5"} component="div" sx={{ fontWeight: 'bold' }}>
                {statistics.totalDaysStudied}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Total Days Studied
              </Typography>
            </CardContent>
          </StatCard>
        </Grid>
        
        <Grid item xs={6} sm={6} md={3}>
          <StatCard>
            <CardContent sx={{ textAlign: 'center', p: isMobile ? 1.5 : 3 }}>
              <InsightsIcon sx={{ fontSize: isMobile ? 28 : 40, color: '#2196F3', mb: 1 }} />
              <Typography variant={isMobile ? "h6" : "h5"} component="div" sx={{ fontWeight: 'bold' }}>
                {statistics.studyFrequency}%
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Study Frequency
              </Typography>
            </CardContent>
          </StatCard>
        </Grid>
        
        <Grid item xs={6} sm={6} md={3}>
          <StatCard>
            <CardContent sx={{ textAlign: 'center', p: isMobile ? 1.5 : 3 }}>
              <ScheduleIcon sx={{ fontSize: isMobile ? 28 : 40, color: '#FF9800', mb: 1 }} />
              <Typography variant={isMobile ? "h6" : "h5"} component="div" sx={{ fontWeight: 'bold' }}>
                {statistics.currentStreak}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Current Streak
              </Typography>
            </CardContent>
          </StatCard>
        </Grid>
      </Grid>
      
      {/* Calendar */}
      <Paper 
        elevation={0} 
        sx={{ 
          p: isMobile ? 1 : 3, 
          borderRadius: 4,
          boxShadow: '0 4px 20px rgba(0, 0, 0, 0.08)',
          backgroundColor: '#fff',
        }}
      >
        <Box sx={{ 
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'center',
          mb: 2
        }}>
          <NavButton 
            onClick={prevMonth}
            size="small"
            aria-label="Previous month"
          >
            <ChevronLeftIcon />
          </NavButton>
          
          <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
            {format(currentMonth, 'MMMM yyyy')}
          </Typography>
          
          <NavButton 
            onClick={nextMonth}
            size="small"
            aria-label="Next month"
          >
            <ChevronRightIcon />
          </NavButton>
        </Box>
        
        <Box sx={{ display: 'flex', justifyContent: 'center', mb: 2 }}>
          <Tooltip title="Go to today">
            <Button 
              variant="outlined" 
              size="small" 
              onClick={resetToCurrentMonth}
              startIcon={<TodayIcon />}
            >
              Today
            </Button>
          </Tooltip>
        </Box>
        
        <Divider sx={{ mb: 2 }} />
        
        {/* Days of Week */}
        <Box sx={{ 
          display: 'flex', 
          flexWrap: 'wrap',
          justifyContent: 'center',
          mb: 1
        }}>
          {daysOfWeek.map(day => (
            <Box 
              key={day}
              sx={{ 
                width: isMobile ? '28px' : '36px', 
                textAlign: 'center', 
                margin: '2px',
                fontWeight: 'bold',
                fontSize: isMobile ? '0.7rem' : '0.8rem',
                color: day === 'Sun' || day === 'Sat' ? theme.palette.text.secondary : theme.palette.text.primary
              }}
            >
              {isMobile ? day.charAt(0) : day}
            </Box>
          ))}
        </Box>
        
        {/* Calendar Grid */}
        <Box sx={{ 
          display: 'flex', 
          flexWrap: 'wrap',
          justifyContent: 'center'
        }}>
          {generateCalendarDays()}
        </Box>
        
        {/* Legend */}
        <Stack 
          direction={isMobile ? 'column' : 'row'} 
          spacing={isMobile ? 1 : 2}
          sx={{ 
            justifyContent: 'center',
            alignItems: isMobile ? 'flex-start' : 'center',
            mt: 2,
            px: 2
          }}
        >
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <Box sx={{ 
              width: 14, 
              height: 14, 
              borderRadius: '50%', 
              backgroundColor: theme.palette.primary.main,
              mr: 1
            }} />
            <Typography variant="body2">Study Day</Typography>
          </Box>
          
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <Box sx={{ 
              width: 14, 
              height: 14, 
              borderRadius: '50%', 
              border: `2px solid ${theme.palette.primary.main}`,
              boxSizing: 'border-box',
              mr: 1
            }} />
            <Typography variant="body2">Today</Typography>
          </Box>
          
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <Box sx={{ 
              width: 14, 
              height: 14, 
              borderRadius: '50%', 
              backgroundColor: 'transparent',
              border: `1px solid ${theme.palette.divider}`,
              mr: 1
            }} />
            <Typography variant="body2">No Study</Typography>
          </Box>
        </Stack>
      </Paper>
    </Box>
  );
};

export default StudyHistory; 