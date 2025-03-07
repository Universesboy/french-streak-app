import React, { useState } from 'react';
import { 
  Paper, 
  Typography, 
  Box, 
  Tabs, 
  Tab, 
  useTheme,
  Grid
} from '@mui/material';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  Cell
} from 'recharts';
import { 
  format, 
  startOfWeek, 
  endOfWeek, 
  eachDayOfInterval,
  getWeek,
  getMonth,
  getYear,
  startOfMonth,
  endOfMonth,
  isSameDay
} from 'date-fns';
import { StudySession, formatTime } from '../utils/streakUtils';

interface StudyTimeSummaryProps {
  studySessions: StudySession[];
  ongoingSession: StudySession | null;
}

const StudyTimeSummary: React.FC<StudyTimeSummaryProps> = ({ 
  studySessions = [],
  ongoingSession = null
}) => {
  const theme = useTheme();
  const [timeRange, setTimeRange] = useState<'week' | 'month' | 'year'>('week');
  
  // Get all sessions including ongoing, with safety check
  const allSessions = ongoingSession 
    ? [...(studySessions || []), ongoingSession]
    : (studySessions || []);
  
  // Calculate total study time
  const totalStudyTime = allSessions.reduce((total, session) => {
    return total + session.duration;
  }, 0);
  
  // Get data for the current week
  const getWeekData = () => {
    const today = new Date();
    const weekStart = startOfWeek(today, { weekStartsOn: 0 }); // Sunday as first day
    const weekEnd = endOfWeek(today, { weekStartsOn: 0 });
    const daysOfWeek = eachDayOfInterval({ start: weekStart, end: weekEnd });
    
    return daysOfWeek.map(day => {
      const dayStr = format(day, 'yyyy-MM-dd');
      const daySessions = allSessions.filter(session => session.date === dayStr);
      const totalTime = daySessions.reduce((total, session) => total + session.duration, 0);
      
      return {
        name: format(day, 'EEE'),
        fullDate: format(day, 'MMM d'),
        time: Math.round(totalTime / 60), // Convert to minutes
        isToday: isSameDay(day, today)
      };
    });
  };
  
  // Get data for the current month
  const getMonthData = () => {
    const today = new Date();
    const monthStart = startOfMonth(today);
    const monthEnd = endOfMonth(today);
    const daysInMonth = eachDayOfInterval({ start: monthStart, end: monthEnd });
    
    // Group by week
    const weekData: { [key: string]: number } = {};
    
    daysInMonth.forEach(day => {
      const weekNum = getWeek(day);
      const weekKey = `Week ${weekNum}`;
      const dayStr = format(day, 'yyyy-MM-dd');
      const daySessions = allSessions.filter(session => session.date === dayStr);
      const dayTime = daySessions.reduce((total, session) => total + session.duration, 0);
      
      if (!weekData[weekKey]) {
        weekData[weekKey] = 0;
      }
      
      weekData[weekKey] += dayTime;
    });
    
    return Object.entries(weekData).map(([name, time]) => ({
      name,
      time: Math.round(time / 60), // Convert to minutes
      isToday: false
    }));
  };
  
  // Get data for the current year
  const getYearData = () => {
    const today = new Date();
    const currentYear = getYear(today);
    
    // Group by month
    const monthData: { [key: string]: number } = {};
    
    // Initialize all months
    for (let i = 0; i < 12; i++) {
      const monthName = format(new Date(currentYear, i, 1), 'MMM');
      monthData[monthName] = 0;
    }
    
    // Fill in data
    allSessions.forEach(session => {
      const sessionDate = new Date(session.date);
      if (getYear(sessionDate) === currentYear) {
        const monthName = format(sessionDate, 'MMM');
        monthData[monthName] += session.duration;
      }
    });
    
    return Object.entries(monthData).map(([name, time]) => ({
      name,
      time: Math.round(time / 60), // Convert to minutes
      isToday: false
    }));
  };
  
  // Get chart data based on selected time range
  const getChartData = () => {
    switch (timeRange) {
      case 'week':
        return getWeekData();
      case 'month':
        return getMonthData();
      case 'year':
        return getYearData();
      default:
        return getWeekData();
    }
  };
  
  const chartData = getChartData();
  
  // Calculate average study time per day/week/month
  const calculateAverage = () => {
    if (chartData.length === 0) return 0;
    
    const totalTime = chartData.reduce((sum, item) => sum + item.time, 0);
    return Math.round(totalTime / chartData.length);
  };
  
  const averageTime = calculateAverage();
  
  // Handle tab change
  const handleTabChange = (_event: React.SyntheticEvent, newValue: 'week' | 'month' | 'year') => {
    // Ensure newValue is one of the allowed values
    if (newValue === 'week' || newValue === 'month' || newValue === 'year') {
      setTimeRange(newValue);
    }
  };
  
  // Custom tooltip for the chart
  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <Box
          sx={{
            backgroundColor: 'background.paper',
            p: 1.5,
            border: '1px solid',
            borderColor: 'divider',
            borderRadius: 1,
            boxShadow: 1
          }}
        >
          <Typography variant="subtitle2">{label}</Typography>
          <Typography variant="body2" color="text.secondary">
            {payload[0].payload.fullDate && `${payload[0].payload.fullDate}: `}
            {payload[0].value} minutes
          </Typography>
        </Box>
      );
    }
    
    return null;
  };
  
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
        Study Time Summary
      </Typography>
      
      <Grid container spacing={3} sx={{ mb: 3 }}>
        <Grid item xs={12} sm={6}>
          <Box 
            sx={{ 
              textAlign: 'center',
              p: 2,
              borderRadius: 2,
              border: '1px solid',
              borderColor: 'divider'
            }}
          >
            <Typography variant="subtitle2" color="text.secondary" gutterBottom>
              Total Study Time
            </Typography>
            <Typography variant="h4" sx={{ fontWeight: 'bold' }}>
              {formatTime(totalStudyTime)}
            </Typography>
          </Box>
        </Grid>
        
        <Grid item xs={12} sm={6}>
          <Box 
            sx={{ 
              textAlign: 'center',
              p: 2,
              borderRadius: 2,
              border: '1px solid',
              borderColor: 'divider'
            }}
          >
            <Typography variant="subtitle2" color="text.secondary" gutterBottom>
              Average {timeRange === 'week' ? 'Daily' : timeRange === 'month' ? 'Weekly' : 'Monthly'}
            </Typography>
            <Typography variant="h4" sx={{ fontWeight: 'bold' }}>
              {averageTime} min
            </Typography>
          </Box>
        </Grid>
      </Grid>
      
      <Tabs 
        value={timeRange} 
        onChange={handleTabChange} 
        centered
        sx={{ mb: 3 }}
      >
        <Tab label="Week" value="week" />
        <Tab label="Month" value="month" />
        <Tab label="Year" value="year" />
      </Tabs>
      
      <Box sx={{ height: 300, width: '100%' }}>
        {chartData.length > 0 ? (
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={chartData}
              margin={{ top: 10, right: 10, left: 0, bottom: 20 }}
            >
              <CartesianGrid strokeDasharray="3 3" vertical={false} />
              <XAxis 
                dataKey="name" 
                tick={{ fontSize: 12 }}
                tickMargin={10}
              />
              <YAxis 
                unit=" min" 
                tick={{ fontSize: 12 }}
                width={50}
              />
              <Tooltip content={<CustomTooltip />} />
              <Bar dataKey="time" radius={[4, 4, 0, 0]}>
                {chartData.map((entry, index) => (
                  <Cell 
                    key={`cell-${index}`} 
                    fill={entry.isToday ? theme.palette.secondary.main : theme.palette.primary.main} 
                  />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        ) : (
          <Box 
            sx={{ 
              height: '100%', 
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: 'center' 
            }}
          >
            <Typography variant="body1" color="text.secondary">
              No study data available for this time period
            </Typography>
          </Box>
        )}
      </Box>
    </Paper>
  );
};

export default StudyTimeSummary; 