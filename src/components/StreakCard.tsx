import React from 'react';
import { 
  Card, 
  CardContent, 
  Typography, 
  Box,
  LinearProgress,
  Divider,
  styled
} from '@mui/material';
import EmojiEventsIcon from '@mui/icons-material/EmojiEvents';
import MonetizationOnIcon from '@mui/icons-material/MonetizationOn';
import { calculateDailyReward } from '../utils/streakUtils';

interface StreakCardProps {
  currentStreak: number;
  totalReward: number;
}

const StyledCard = styled(Card)(({ theme }) => ({
  maxWidth: 600,
  margin: '0 auto',
  boxShadow: '0 8px 24px rgba(0, 0, 0, 0.12)',
  borderRadius: 16,
  overflow: 'visible',
}));

const StreakProgress = styled(LinearProgress)(({ theme }) => ({
  height: 10,
  borderRadius: 5,
  marginTop: 8,
  marginBottom: 8,
}));

const IconWrapper = styled(Box)(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  marginBottom: 8,
  '& svg': {
    marginRight: 8,
    color: '#FFD700', // Gold color for the icons
  }
}));

const StreakCard: React.FC<StreakCardProps> = ({ currentStreak, totalReward }) => {
  // Calculate progress to the next reward level
  const daysToNextLevel = currentStreak % 2 === 0 ? 2 : 1;
  const progressToNextLevel = (currentStreak % 2) * 50; // 0% or 50%
  
  // Get the current reward per day
  const currentDailyReward = calculateDailyReward(currentStreak);
  
  // Calculate the next milestone
  const nextMilestone = currentStreak % 2 === 0 ? currentStreak + 2 : currentStreak + 1;
  const nextReward = calculateDailyReward(nextMilestone);

  return (
    <StyledCard>
      <CardContent>
        <IconWrapper>
          <EmojiEventsIcon fontSize="large" />
          <Typography variant="h4" component="div">
            {currentStreak} Day Streak
          </Typography>
        </IconWrapper>

        <Box sx={{ mb: 2 }}>
          <Typography variant="body2" color="text.secondary">
            {currentStreak % 2 === 0 ? 
              'You completed a reward level!' : 
              `${daysToNextLevel} day${daysToNextLevel > 1 ? 's' : ''} until next reward increase`}
          </Typography>
          <StreakProgress 
            variant="determinate" 
            value={progressToNextLevel} 
            color="secondary"
          />
        </Box>

        <Divider sx={{ my: 2 }} />

        <IconWrapper>
          <MonetizationOnIcon fontSize="large" />
          <Typography variant="h5" component="div">
            ${totalReward.toFixed(2)} Earned
          </Typography>
        </IconWrapper>

        <Box sx={{ mt: 2 }}>
          <Typography variant="body1">
            Current reward: ${currentDailyReward}/day
          </Typography>
          {currentStreak % 2 !== 0 && (
            <Typography variant="body2" color="text.secondary">
              Next level: ${nextReward}/day after {daysToNextLevel} more day{daysToNextLevel > 1 ? 's' : ''}
            </Typography>
          )}
        </Box>
      </CardContent>
    </StyledCard>
  );
};

export default StreakCard; 