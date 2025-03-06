import React, { useState } from 'react';
import {
  Box,
  Typography,
  Paper,
  Tabs,
  Tab,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Card,
  CardContent,
  Grid,
  Divider,
  styled,
  useTheme,
  useMediaQuery,
  Collapse,
  IconButton,
  Chip
} from '@mui/material';
import {
  TimelapseTwoTone as TimerIcon,
  CalendarToday as CalendarIcon,
  ViewWeek as WeekIcon,
  DateRange as MonthIcon,
  Timeline as YearIcon,
  ExpandMore as ExpandMoreIcon
} from '@mui/icons-material';
import { format } from 'date-fns';
import { 
  formatTime, 
  getDailyStudyTimeSummary, 
  getWeeklyStudyTimeSummary, 
  getMonthlyStudyTimeSummary, 
  getYearlyStudyTimeSummary,
  getRecentStudySummary
} from '../utils/streakUtils';
import type { StreakData } from '../utils/streakUtils';

interface StudyTimeSummaryProps {
  streakData: StreakData;
}

const SummaryCard = styled(Card)(({ theme }) => ({
  height: '100%',
  boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
  borderRadius: 16,
  transition: 'transform 0.2s',
  '&:hover': {
    transform: 'translateY(-4px)',
  },
}));

const ExpandMore = styled(IconButton)<{ expanded: boolean }>(({ theme, expanded }) => ({
  transform: expanded ? 'rotate(180deg)' : 'rotate(0deg)',
  marginLeft: 'auto',
  transition: theme.transitions.create('transform', {
    duration: theme.transitions.duration.shortest,
  }),
}));

const StudyTimeSummary: React.FC<StudyTimeSummaryProps> = ({ streakData }) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const [tabValue, setTabValue] = useState(0);
  const [expandedCards, setExpandedCards] = useState<Record<string, boolean>>({ today: true });
  
  // Get summary data
  const recentSummary = getRecentStudySummary(streakData);
  const dailySummary = getDailyStudyTimeSummary(streakData.studySessions);
  const weeklySummary = getWeeklyStudyTimeSummary(streakData.studySessions);
  const monthlySummary = getMonthlyStudyTimeSummary(streakData.studySessions);
  const yearlySummary = getYearlyStudyTimeSummary(streakData.studySessions);
  
  // Handle tab change
  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };
  
  // Toggle expanding a card
  const toggleExpandCard = (cardId: string) => {
    setExpandedCards(prev => ({
      ...prev,
      [cardId]: !prev[cardId]
    }));
  };
  
  // Format daily date for display
  const formatDailyDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return format(date, isMobile ? 'MMM d, yyyy' : 'MMMM d, yyyy (EEEE)');
  };
  
  // Format week for display
  const formatWeek = (weekKey: string) => {
    const [year, week] = weekKey.split('-W');
    return `Week ${week}, ${year}`;
  };
  
  // Format month for display
  const formatMonth = (monthKey: string) => {
    const [year, month] = monthKey.split('-');
    const date = new Date(parseInt(year), parseInt(month) - 1, 1);
    return format(date, 'MMMM yyyy');
  };
  
  // Convert summary object to array for table display
  const getSummaryArray = (summary: Record<string, number>, formatFn?: (key: string) => string) => {
    return Object.entries(summary)
      .map(([key, duration]) => ({
        key,
        label: formatFn ? formatFn(key) : key,
        duration
      }))
      .sort((a, b) => b.key.localeCompare(a.key)); // Sort newest first
  };
  
  // Render a mobile summary card
  const renderMobileSummaryCard = (
    title: string, 
    cardId: string, 
    icon: React.ReactNode,
    data: Array<{ key: string, label: string, duration: number }>,
    color: string
  ) => {
    const isExpanded = expandedCards[cardId] || false;
    
    return (
      <Card sx={{ mb: 2, borderRadius: 2, overflow: 'visible' }}>
        <CardContent sx={{ p: 2, pb: isExpanded ? 1 : 2 }}>
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <Box sx={{ mr: 1.5, color }}>{icon}</Box>
            <Typography variant="subtitle1" fontWeight="bold">{title}</Typography>
            <ExpandMore
              expanded={isExpanded}
              onClick={() => toggleExpandCard(cardId)}
              aria-expanded={isExpanded}
              aria-label="show more"
              size="small"
            >
              <ExpandMoreIcon />
            </ExpandMore>
          </Box>
          
          <Collapse in={isExpanded} timeout="auto" unmountOnExit>
            <Box sx={{ mt: 2 }}>
              {data.length > 0 ? (
                <Box>
                  {data.slice(0, 5).map((item) => (
                    <Box key={item.key} sx={{ 
                      display: 'flex', 
                      justifyContent: 'space-between', 
                      py: 1,
                      borderBottom: 1,
                      borderColor: 'divider'
                    }}>
                      <Typography variant="body2" sx={{ fontWeight: 500 }}>
                        {item.label}
                      </Typography>
                      <Chip 
                        label={formatTime(item.duration)} 
                        size="small" 
                        color="primary" 
                        variant="outlined"
                        sx={{ fontWeight: 600 }}
                      />
                    </Box>
                  ))}
                  
                  {data.length > 5 && (
                    <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 1, textAlign: 'center' }}>
                      + {data.length - 5} more entries
                    </Typography>
                  )}
                </Box>
              ) : (
                <Typography variant="body2" color="text.secondary" sx={{ py: 2, textAlign: 'center' }}>
                  No data available yet
                </Typography>
              )}
            </Box>
          </Collapse>
        </CardContent>
      </Card>
    );
  };
  
  // Render the current tab content
  const renderTabContent = () => {
    if (!recentSummary) {
      return (
        <Box sx={{ py: 4, textAlign: 'center' }}>
          <Typography variant="body1" color="text.secondary">
            No study sessions recorded yet. Start tracking your study time to see summaries here!
          </Typography>
        </Box>
      );
    }
    
    // For mobile devices, use cards with collapsible sections
    if (isMobile) {
      const summaryData = [
        {
          title: 'Daily Summary',
          cardId: 'daily',
          icon: <CalendarIcon />,
          data: getSummaryArray(dailySummary, formatDailyDate),
          color: theme.palette.primary.main
        },
        {
          title: 'Weekly Summary',
          cardId: 'weekly',
          icon: <WeekIcon />,
          data: getSummaryArray(weeklySummary, formatWeek),
          color: theme.palette.info.main
        },
        {
          title: 'Monthly Summary',
          cardId: 'monthly',
          icon: <MonthIcon />,
          data: getSummaryArray(monthlySummary, formatMonth),
          color: theme.palette.secondary.main
        },
        {
          title: 'Yearly Summary',
          cardId: 'yearly',
          icon: <YearIcon />,
          data: getSummaryArray(yearlySummary),
          color: theme.palette.success.main
        }
      ];
      
      const currentSummaryData = summaryData[tabValue];
      
      return (
        <Box>
          {renderMobileSummaryCard(
            currentSummaryData.title,
            currentSummaryData.cardId,
            currentSummaryData.icon,
            currentSummaryData.data,
            currentSummaryData.color
          )}
        </Box>
      );
    }
    
    // Desktop tables
    switch (tabValue) {
      case 0: // Daily
        return (
          <TableContainer component={Paper} elevation={0} sx={{ mt: 2 }}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Date</TableCell>
                  <TableCell align="right">Time Studied</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {getSummaryArray(dailySummary, formatDailyDate).map((day) => (
                  <TableRow key={day.key}>
                    <TableCell component="th" scope="row">
                      {day.label}
                    </TableCell>
                    <TableCell align="right">{formatTime(day.duration)}</TableCell>
                  </TableRow>
                ))}
                {Object.keys(dailySummary).length === 0 && (
                  <TableRow>
                    <TableCell colSpan={2} align="center">
                      No daily data available yet
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </TableContainer>
        );
        
      case 1: // Weekly
        return (
          <TableContainer component={Paper} elevation={0} sx={{ mt: 2 }}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Week</TableCell>
                  <TableCell align="right">Time Studied</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {getSummaryArray(weeklySummary, formatWeek).map((week) => (
                  <TableRow key={week.key}>
                    <TableCell component="th" scope="row">
                      {week.label}
                    </TableCell>
                    <TableCell align="right">{formatTime(week.duration)}</TableCell>
                  </TableRow>
                ))}
                {Object.keys(weeklySummary).length === 0 && (
                  <TableRow>
                    <TableCell colSpan={2} align="center">
                      No weekly data available yet
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </TableContainer>
        );
        
      case 2: // Monthly
        return (
          <TableContainer component={Paper} elevation={0} sx={{ mt: 2 }}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Month</TableCell>
                  <TableCell align="right">Time Studied</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {getSummaryArray(monthlySummary, formatMonth).map((month) => (
                  <TableRow key={month.key}>
                    <TableCell component="th" scope="row">
                      {month.label}
                    </TableCell>
                    <TableCell align="right">{formatTime(month.duration)}</TableCell>
                  </TableRow>
                ))}
                {Object.keys(monthlySummary).length === 0 && (
                  <TableRow>
                    <TableCell colSpan={2} align="center">
                      No monthly data available yet
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </TableContainer>
        );
        
      case 3: // Yearly
        return (
          <TableContainer component={Paper} elevation={0} sx={{ mt: 2 }}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Year</TableCell>
                  <TableCell align="right">Time Studied</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {getSummaryArray(yearlySummary).map((year) => (
                  <TableRow key={year.key}>
                    <TableCell component="th" scope="row">
                      {year.key}
                    </TableCell>
                    <TableCell align="right">{formatTime(year.duration)}</TableCell>
                  </TableRow>
                ))}
                {Object.keys(yearlySummary).length === 0 && (
                  <TableRow>
                    <TableCell colSpan={2} align="center">
                      No yearly data available yet
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </TableContainer>
        );
        
      default:
        return null;
    }
  };
  
  return (
    <Box sx={{ mt: 4 }}>
      <Typography variant="h5" component="h2" sx={{ 
        display: 'flex', 
        alignItems: 'center', 
        mb: 3,
        fontWeight: 'bold'
      }}>
        <TimerIcon sx={{ mr: 1, color: theme.palette.primary.main }} />
        Study Time Summary
      </Typography>
      
      {recentSummary && (
        <Grid container spacing={isMobile ? 1 : 2} sx={{ mb: 4 }}>
          <Grid item xs={6} sm={6} md={3}>
            <SummaryCard>
              <CardContent sx={{ textAlign: 'center', p: isMobile ? 1.5 : 3 }}>
                <CalendarIcon sx={{ fontSize: isMobile ? 28 : 36, color: theme.palette.primary.main, mb: 1 }} />
                <Typography variant={isMobile ? "h6" : "h5"} sx={{ fontWeight: 'bold' }}>
                  {formatTime(recentSummary.today.totalTime).split(':').slice(0, 2).join(':')}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Today
                </Typography>
              </CardContent>
            </SummaryCard>
          </Grid>
          
          <Grid item xs={6} sm={6} md={3}>
            <SummaryCard>
              <CardContent sx={{ textAlign: 'center', p: isMobile ? 1.5 : 3 }}>
                <WeekIcon sx={{ fontSize: isMobile ? 28 : 36, color: theme.palette.info.main, mb: 1 }} />
                <Typography variant={isMobile ? "h6" : "h5"} sx={{ fontWeight: 'bold' }}>
                  {formatTime(recentSummary.thisWeek.totalTime).split(':').slice(0, 2).join(':')}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  This Week
                </Typography>
              </CardContent>
            </SummaryCard>
          </Grid>
          
          <Grid item xs={6} sm={6} md={3}>
            <SummaryCard>
              <CardContent sx={{ textAlign: 'center', p: isMobile ? 1.5 : 3 }}>
                <MonthIcon sx={{ fontSize: isMobile ? 28 : 36, color: theme.palette.secondary.main, mb: 1 }} />
                <Typography variant={isMobile ? "h6" : "h5"} sx={{ fontWeight: 'bold' }}>
                  {formatTime(recentSummary.thisMonth.totalTime).split(':').slice(0, 2).join(':')}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  This Month
                </Typography>
              </CardContent>
            </SummaryCard>
          </Grid>
          
          <Grid item xs={6} sm={6} md={3}>
            <SummaryCard>
              <CardContent sx={{ textAlign: 'center', p: isMobile ? 1.5 : 3 }}>
                <YearIcon sx={{ fontSize: isMobile ? 28 : 36, color: theme.palette.success.main, mb: 1 }} />
                <Typography variant={isMobile ? "h6" : "h5"} sx={{ fontWeight: 'bold' }}>
                  {formatTime(recentSummary.thisYear.totalTime).split(':').slice(0, 2).join(':')}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  This Year
                </Typography>
              </CardContent>
            </SummaryCard>
          </Grid>
        </Grid>
      )}
      
      <Paper 
        elevation={0}
        sx={{ 
          p: isMobile ? 1.5 : 3, 
          borderRadius: 4,
          boxShadow: '0 4px 20px rgba(0, 0, 0, 0.08)',
          backgroundColor: '#fff',
        }}
      >
        <Tabs 
          value={tabValue} 
          onChange={handleTabChange}
          indicatorColor="primary"
          textColor="primary"
          variant={isMobile ? "fullWidth" : "standard"}
          aria-label="study summary tabs"
          sx={{
            '& .MuiTab-root': {
              minWidth: isMobile ? 'auto' : 100,
              fontSize: isMobile ? '0.8rem' : '0.9rem',
              padding: isMobile ? '10px 4px' : undefined,
            }
          }}
        >
          <Tab 
            label="Daily" 
            icon={isMobile ? <CalendarIcon /> : undefined} 
            iconPosition="start" 
          />
          <Tab 
            label="Weekly" 
            icon={isMobile ? <WeekIcon /> : undefined} 
            iconPosition="start" 
          />
          <Tab 
            label="Monthly" 
            icon={isMobile ? <MonthIcon /> : undefined} 
            iconPosition="start" 
          />
          <Tab 
            label="Yearly" 
            icon={isMobile ? <YearIcon /> : undefined} 
            iconPosition="start" 
          />
        </Tabs>
        
        <Divider sx={{ mb: 2 }} />
        
        {renderTabContent()}
      </Paper>
    </Box>
  );
};

export default StudyTimeSummary; 