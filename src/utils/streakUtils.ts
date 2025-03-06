import { differenceInDays, isSameDay, startOfDay, format, parse, isValid, isBefore, isAfter, getWeek, getMonth, getYear, startOfWeek, endOfWeek, startOfMonth, endOfMonth, startOfYear, endOfYear, eachDayOfInterval } from 'date-fns';

export interface StudySession {
  startTime: string; // ISO string
  endTime: string | null; // ISO string, null if session is ongoing
  duration: number; // in seconds
  date: string; // YYYY-MM-DD format
}

export interface StreakData {
  currentStreak: number;
  lastCheckInDate: string | null;
  totalReward: number;
  // Add history of study days and stats
  studyDays: string[];
  longestStreak: number;
  totalDaysStudied: number;
  // Add study sessions
  studySessions: StudySession[];
  ongoingSession: StudySession | null;
}

const STORAGE_KEY = 'french-streak-data';

// Initialize streak data from localStorage or with default values
export const initStreakData = (): StreakData => {
  const storedData = localStorage.getItem(STORAGE_KEY);
  
  if (storedData) {
    return JSON.parse(storedData);
  }
  
  return {
    currentStreak: 0,
    lastCheckInDate: null,
    totalReward: 0,
    studyDays: [],
    longestStreak: 0,
    totalDaysStudied: 0,
    studySessions: [],
    ongoingSession: null
  };
};

// Save streak data to localStorage
export const saveStreakData = (data: StreakData): void => {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
};

// Calculate the reward for a given streak day
export const calculateDailyReward = (day: number): number => {
  // $1 for days 1-2, $2 for days 3-4, $3 for days 5-6, etc.
  return Math.ceil(day / 2);
};

// Calculate total reward for a streak
export const calculateTotalReward = (streak: number): number => {
  let total = 0;
  for (let i = 1; i <= streak; i++) {
    total += calculateDailyReward(i);
  }
  return total;
};

// Check if the user can check in today
export const canCheckInToday = (lastCheckInDate: string | null): boolean => {
  if (!lastCheckInDate) {
    return true;
  }
  
  const today = startOfDay(new Date());
  const lastDate = startOfDay(new Date(lastCheckInDate));
  
  return !isSameDay(today, lastDate);
};

// Get formatted date string
export const getFormattedDate = (date: Date): string => {
  return format(date, 'yyyy-MM-dd');
};

// Calculate longest streak from study days
export const calculateLongestStreak = (studyDays: string[]): number => {
  if (studyDays.length === 0) return 0;
  
  // Sort study days chronologically
  const sortedDays = [...studyDays].sort((a, b) => {
    const dateA = new Date(a);
    const dateB = new Date(b);
    return dateA.getTime() - dateB.getTime();
  });
  
  let longestStreak = 1;
  let currentStreak = 1;
  
  for (let i = 1; i < sortedDays.length; i++) {
    const currentDate = new Date(sortedDays[i]);
    const prevDate = new Date(sortedDays[i-1]);
    
    // If the difference is exactly 1 day
    if (differenceInDays(currentDate, prevDate) === 1) {
      currentStreak++;
      longestStreak = Math.max(longestStreak, currentStreak);
    } else if (differenceInDays(currentDate, prevDate) > 1) {
      // Reset the streak if days are not consecutive
      currentStreak = 1;
    }
  }
  
  return longestStreak;
};

// Get study statistics
export const getStudyStatistics = (data: StreakData) => {
  const { studyDays, currentStreak, longestStreak, totalDaysStudied } = data;
  
  // Calculate study frequency (study days / total days since first study)
  let studyFrequency = 0;
  if (studyDays.length > 0) {
    const sortedDays = [...studyDays].sort();
    const firstStudyDay = new Date(sortedDays[0]);
    const today = new Date();
    const totalDaysSinceStart = differenceInDays(today, firstStudyDay) + 1;
    
    studyFrequency = totalDaysStudied / totalDaysSinceStart;
  }
  
  return {
    currentStreak,
    longestStreak,
    totalDaysStudied,
    studyFrequency: Math.round(studyFrequency * 100) // as percentage
  };
};

// Format seconds into a readable time format (HH:MM:SS)
export const formatTime = (seconds: number): string => {
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const secs = seconds % 60;
  
  return [
    hours.toString().padStart(2, '0'),
    minutes.toString().padStart(2, '0'),
    secs.toString().padStart(2, '0')
  ].join(':');
};

// Start a new study session
export const startStudySession = (data: StreakData): StreakData => {
  // If there's already an ongoing session, return the data unchanged
  if (data.ongoingSession) {
    return data;
  }
  
  const now = new Date();
  const today = getFormattedDate(now);
  
  const newSession: StudySession = {
    startTime: now.toISOString(),
    endTime: null,
    duration: 0,
    date: today
  };
  
  return {
    ...data,
    ongoingSession: newSession
  };
};

// End the current study session
export const endStudySession = (data: StreakData): StreakData => {
  // If there's no ongoing session, return the data unchanged
  if (!data.ongoingSession) {
    return data;
  }
  
  const now = new Date();
  const startTime = new Date(data.ongoingSession.startTime);
  const durationInSeconds = Math.floor((now.getTime() - startTime.getTime()) / 1000);
  
  const completedSession: StudySession = {
    ...data.ongoingSession,
    endTime: now.toISOString(),
    duration: durationInSeconds
  };
  
  return {
    ...data,
    studySessions: [...data.studySessions, completedSession],
    ongoingSession: null
  };
};

// Get time studied in a specific date range
export const getTimeStudiedInRange = (sessions: StudySession[], startDate: Date, endDate: Date): number => {
  const filteredSessions = sessions.filter(session => {
    const sessionDate = new Date(session.date);
    return !isBefore(sessionDate, startDate) && !isAfter(sessionDate, endDate);
  });
  
  return filteredSessions.reduce((total, session) => total + session.duration, 0);
};

// Get daily study time summary
export const getDailyStudyTimeSummary = (sessions: StudySession[]): Record<string, number> => {
  const summary: Record<string, number> = {};
  
  sessions.forEach(session => {
    const { date, duration } = session;
    
    if (!summary[date]) {
      summary[date] = 0;
    }
    
    summary[date] += duration;
  });
  
  return summary;
};

// Get weekly study time summary
export const getWeeklyStudyTimeSummary = (sessions: StudySession[]): Record<string, number> => {
  const summary: Record<string, number> = {};
  
  sessions.forEach(session => {
    const sessionDate = new Date(session.date);
    const weekStart = startOfWeek(sessionDate, { weekStartsOn: 0 }); // Sunday as first day
    const weekKey = `${getYear(weekStart)}-W${getWeek(weekStart, { weekStartsOn: 0 })}`;
    
    if (!summary[weekKey]) {
      summary[weekKey] = 0;
    }
    
    summary[weekKey] += session.duration;
  });
  
  return summary;
};

// Get monthly study time summary
export const getMonthlyStudyTimeSummary = (sessions: StudySession[]): Record<string, number> => {
  const summary: Record<string, number> = {};
  
  sessions.forEach(session => {
    const sessionDate = new Date(session.date);
    const monthKey = `${getYear(sessionDate)}-${String(getMonth(sessionDate) + 1).padStart(2, '0')}`;
    
    if (!summary[monthKey]) {
      summary[monthKey] = 0;
    }
    
    summary[monthKey] += session.duration;
  });
  
  return summary;
};

// Get yearly study time summary
export const getYearlyStudyTimeSummary = (sessions: StudySession[]): Record<string, number> => {
  const summary: Record<string, number> = {};
  
  sessions.forEach(session => {
    const sessionDate = new Date(session.date);
    const yearKey = String(getYear(sessionDate));
    
    if (!summary[yearKey]) {
      summary[yearKey] = 0;
    }
    
    summary[yearKey] += session.duration;
  });
  
  return summary;
};

// Get the most recent study session summary
export const getRecentStudySummary = (data: StreakData) => {
  const { studySessions } = data;
  
  if (studySessions.length === 0) {
    return null;
  }
  
  const now = new Date();
  const today = startOfDay(now);
  const todaySessions = studySessions.filter(session => 
    isSameDay(new Date(session.date), today)
  );
  
  const thisWeekStart = startOfWeek(today, { weekStartsOn: 0 });
  const thisWeekEnd = endOfWeek(today, { weekStartsOn: 0 });
  
  const thisMonthStart = startOfMonth(today);
  const thisMonthEnd = endOfMonth(today);
  
  const thisYearStart = startOfYear(today);
  const thisYearEnd = endOfYear(today);
  
  return {
    today: {
      totalSessions: todaySessions.length,
      totalTime: todaySessions.reduce((sum, session) => sum + session.duration, 0)
    },
    thisWeek: {
      totalTime: getTimeStudiedInRange(studySessions, thisWeekStart, thisWeekEnd)
    },
    thisMonth: {
      totalTime: getTimeStudiedInRange(studySessions, thisMonthStart, thisMonthEnd)
    },
    thisYear: {
      totalTime: getTimeStudiedInRange(studySessions, thisYearStart, thisYearEnd)
    },
    allTime: {
      totalSessions: studySessions.length,
      totalTime: studySessions.reduce((sum, session) => sum + session.duration, 0)
    }
  };
};

// Update streak data after a check-in
export const updateStreakAfterCheckIn = (data: StreakData): StreakData => {
  const today = new Date();
  const lastCheckInDate = data.lastCheckInDate ? new Date(data.lastCheckInDate) : null;
  
  let newStreak = data.currentStreak;
  
  // If this is the first check-in or there's no streak yet
  if (!lastCheckInDate) {
    newStreak = 1;
  } 
  // If user checked in yesterday, increment the streak
  else if (differenceInDays(today, lastCheckInDate) === 1) {
    newStreak += 1;
  } 
  // If user checked in today already, don't change streak
  else if (isSameDay(today, lastCheckInDate)) {
    return data;
  } 
  // If user missed a day or more, reset streak
  else {
    newStreak = 1;
  }
  
  // Format today's date as YYYY-MM-DD
  const todayFormatted = getFormattedDate(today);
  
  // Add today to study days if not already included
  const newStudyDays = data.studyDays.includes(todayFormatted)
    ? data.studyDays
    : [...data.studyDays, todayFormatted];
    
  // Calculate new total reward
  const newTotalReward = calculateTotalReward(newStreak);
  
  // Calculate new longest streak
  const newLongestStreak = Math.max(newStreak, data.longestStreak);
  
  // Calculate total days studied
  const newTotalDaysStudied = newStudyDays.length;
  
  return {
    currentStreak: newStreak,
    lastCheckInDate: today.toISOString(),
    totalReward: newTotalReward,
    studyDays: newStudyDays,
    longestStreak: newLongestStreak,
    totalDaysStudied: newTotalDaysStudied,
    studySessions: data.studySessions,
    ongoingSession: data.ongoingSession
  };
}; 