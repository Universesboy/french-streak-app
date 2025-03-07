import React, { useState } from 'react';
import { 
  Paper, 
  Typography, 
  Box, 
  Grid, 
  Tabs, 
  Tab,
  useTheme
} from '@mui/material';
import { 
  format, 
  startOfMonth, 
  endOfMonth, 
  eachDayOfInterval, 
  isSameDay,
  getMonth,
  getYear,
  differenceInCalendarDays
} from 'date-fns';
import { StudySession } from '../utils/streakUtils';

interface StudyHistoryProps {
  studyDays: string[];
  studySessions: StudySession[];
}

const StudyHistory: React.FC<StudyHistoryProps> = ({ studyDays, studySessions }) => {
  const theme = useTheme();
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [tabValue, setTabValue] = useState(0);
  
  // Get days in the current month
  const daysInMonth = eachDayOfInterval({
    start: startOfMonth(currentMonth),
    end: endOfMonth(currentMonth)
  });
  
  // Handle month navigation
  const handlePreviousMonth = () => {
    const prevMonth = new Date(currentMonth);
    prevMonth.setMonth(prevMonth.getMonth() - 1);
    setCurrentMonth(prevMonth);
  };
  
  const handleNextMonth = () => {
    const nextMonth = new Date(currentMonth);
    nextMonth.setMonth(nextMonth.getMonth() + 1);
    setCurrentMonth(nextMonth);
  };
  
  // Handle tab change
  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };
  
  // Get study sessions for the current month
  const monthSessions = studySessions.filter(session => {
    const sessionDate = new Date(session.date);
    return (
      getMonth(sessionDate) === getMonth(currentMonth) &&
      getYear(sessionDate) === getYear(currentMonth)
    );
  });
  
  // Calculate total study time for the month
  const totalMonthStudyTime = monthSessions.reduce((total, session) => {
    return total + session.duration;
  }, 0);
  
  // Format time in hours and minutes
  const formatTime = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    
    if (hours > 0) {
      return `${hours}h ${minutes}m`;
    } else {
      return `${minutes}m`;
    }
  };
  
  // Get study sessions for a specific day
  const getSessionsForDay = (day: Date) => {
    return studySessions.filter(session => {
      const sessionDate = new Date(session.date);
      return isSameDay(sessionDate, day);
    });
  };
  
  // Calculate streak lengths
  const calculateStreakLengths = () => {
    if (studyDays.length === 0) return [];
    
    // Sort study days chronologically
    const sortedDays = [...studyDays].sort((a, b) => {
      return new Date(a).getTime() - new Date(b).getTime();
    });
    
    const streaks: { start: string; end: string; length: number }[] = [];
    let streakStart = sortedDays[0];
    let currentDate = new Date(sortedDays[0]);
    
    for (let i = 1; i < sortedDays.length; i++) {
      const nextDate = new Date(sortedDays[i]);
      const dayDiff = differenceInCalendarDays(nextDate, currentDate);
      
      if (dayDiff > 1) {
        // End of streak
        streaks.push({
          start: streakStart,
          end: sortedDays[i-1],
          length: differenceInCalendarDays(
            new Date(sortedDays[i-1]), 
            new Date(streakStart)
          ) + 1
        });
        streakStart = sortedDays[i];
      }
      
      currentDate = nextDate;
    }
    
    // Add the last streak
    streaks.push({
      start: streakStart,
      end: sortedDays[sortedDays.length - 1],
      length: differenceInCalendarDays(
        new Date(sortedDays[sortedDays.length - 1]), 
        new Date(streakStart)
      ) + 1
    });
    
    // Sort by length (descending)
    return streaks.sort((a, b) => b.length - a.length);
  };
  
  const streaks = calculateStreakLengths();
  
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
        Study History
      </Typography>
      
      <Tabs 
        value={tabValue} 
        onChange={handleTabChange} 
        centered
        sx={{ mb: 3 }}
      >
        <Tab label="Calendar" />
        <Tab label="Streaks" />
        <Tab label="Sessions" />
      </Tabs>
      
      {/* Calendar View */}
      {tabValue === 0 && (
        <>
          <Box 
            sx={{ 
              display: 'flex', 
              justifyContent: 'space-between', 
              alignItems: 'center',
              mb: 2
            }}
          >
            <button
              onClick={handlePreviousMonth}
              style={{ 
                border: 'none', 
                background: 'none', 
                cursor: 'pointer',
                color: theme.palette.primary.main
              }}
            >
              ← Previous
            </button>
            
            <Typography variant="h6">
              {format(currentMonth, 'MMMM yyyy')}
            </Typography>
            
            <button
              onClick={handleNextMonth}
              style={{ 
                border: 'none', 
                background: 'none', 
                cursor: 'pointer',
                color: theme.palette.primary.main
              }}
            >
              Next →
            </button>
          </Box>
          
          <Box sx={{ mb: 2 }}>
            <Typography variant="body2" color="text.secondary" align="center">
              Total study time this month: {formatTime(totalMonthStudyTime)}
            </Typography>
          </Box>
          
          <Grid container spacing={1}>
            {/* Day names */}
            {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day, index) => (
              <Grid item xs={12/7} key={`header-${index}`}>
                <Typography 
                  variant="caption" 
                  align="center" 
                  display="block"
                  sx={{ fontWeight: 'bold' }}
                >
                  {day}
                </Typography>
              </Grid>
            ))}
            
            {/* Empty cells for days before the first of the month */}
            {Array.from({ length: daysInMonth[0].getDay() }).map((_, index) => (
              <Grid item xs={12/7} key={`empty-start-${index}`}>
                <Box 
                  sx={{ 
                    height: 40, 
                    borderRadius: 1,
                    backgroundColor: 'transparent'
                  }}
                />
              </Grid>
            ))}
            
            {/* Calendar days */}
            {daysInMonth.map((day, index) => {
              const formattedDay = format(day, 'yyyy-MM-dd');
              const isStudyDay = studyDays.includes(formattedDay);
              const daySessions = getSessionsForDay(day);
              const totalDayTime = daySessions.reduce((total, session) => {
                return total + session.duration;
              }, 0);
              
              return (
                <Grid item xs={12/7} key={`day-${index}`}>
                  <Box 
                    sx={{ 
                      height: 40, 
                      display: 'flex',
                      flexDirection: 'column',
                      justifyContent: 'center',
                      alignItems: 'center',
                      borderRadius: 1,
                      backgroundColor: isStudyDay ? 
                        `${theme.palette.primary.main}20` : 
                        'transparent',
                      border: '1px solid',
                      borderColor: isStudyDay ? 
                        theme.palette.primary.main : 
                        'divider',
                      position: 'relative'
                    }}
                  >
                    <Typography variant="body2">
                      {format(day, 'd')}
                    </Typography>
                    
                    {totalDayTime > 0 && (
                      <Typography 
                        variant="caption" 
                        sx={{ 
                          fontSize: '0.6rem',
                          color: theme.palette.text.secondary
                        }}
                      >
                        {formatTime(totalDayTime)}
                      </Typography>
                    )}
                  </Box>
                </Grid>
              );
            })}
          </Grid>
        </>
      )}
      
      {/* Streaks View */}
      {tabValue === 1 && (
        <Box>
          {streaks.length > 0 ? (
            <>
              <Typography variant="subtitle1" gutterBottom>
                Your Streak History
              </Typography>
              
              {streaks.map((streak, index) => (
                <Box 
                  key={`streak-${index}`}
                  sx={{ 
                    mb: 2, 
                    p: 2, 
                    borderRadius: 2,
                    border: '1px solid',
                    borderColor: 'divider',
                    backgroundColor: index === 0 ? 
                      `${theme.palette.secondary.main}10` : 
                      'transparent'
                  }}
                >
                  <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
                    {streak.length} day{streak.length !== 1 ? 's' : ''}
                  </Typography>
                  
                  <Typography variant="body2" color="text.secondary">
                    {format(new Date(streak.start), 'MMM d, yyyy')} - {format(new Date(streak.end), 'MMM d, yyyy')}
                  </Typography>
                </Box>
              ))}
            </>
          ) : (
            <Typography variant="body1" align="center" sx={{ py: 4 }}>
              No streak data available yet. Start checking in daily to build your streaks!
            </Typography>
          )}
        </Box>
      )}
      
      {/* Sessions View */}
      {tabValue === 2 && (
        <Box>
          {studySessions.length > 0 ? (
            <>
              <Typography variant="subtitle1" gutterBottom>
                Your Study Sessions
              </Typography>
              
              {studySessions
                .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
                .map((session, index) => (
                  <Box 
                    key={`session-${index}`}
                    sx={{ 
                      mb: 2, 
                      p: 2, 
                      borderRadius: 2,
                      border: '1px solid',
                      borderColor: 'divider'
                    }}
                  >
                    <Typography variant="subtitle2" sx={{ fontWeight: 'bold' }}>
                      {format(new Date(session.date), 'EEEE, MMMM d, yyyy')}
                    </Typography>
                    
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 1 }}>
                      <Typography variant="body2" color="text.secondary">
                        {format(new Date(session.startTime), 'h:mm a')} - 
                        {session.endTime ? format(new Date(session.endTime), ' h:mm a') : ' (ongoing)'}
                      </Typography>
                      
                      <Typography variant="body2" sx={{ fontWeight: 'bold' }}>
                        {formatTime(session.duration)}
                      </Typography>
                    </Box>
                  </Box>
                ))}
            </>
          ) : (
            <Typography variant="body1" align="center" sx={{ py: 4 }}>
              No study sessions recorded yet. Use the timer to track your study time!
            </Typography>
          )}
        </Box>
      )}
    </Paper>
  );
};

export default StudyHistory;