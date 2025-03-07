import React from 'react';
import { 
  Box, 
  Typography, 
  AppBar, 
  Toolbar,
  Container,
  useTheme,
  useMediaQuery,
  styled,
  IconButton,
  Menu,
  MenuItem,
  Avatar,
  Button,
  Chip
} from '@mui/material';
import TranslateIcon from '@mui/icons-material/Translate';
import MenuIcon from '@mui/icons-material/Menu';
import PersonIcon from '@mui/icons-material/Person';
import SettingsIcon from '@mui/icons-material/Settings';
import InfoIcon from '@mui/icons-material/Info';
import LocalFireDepartmentIcon from '@mui/icons-material/LocalFireDepartment';
import LoginIcon from '@mui/icons-material/Login';
import PersonAddIcon from '@mui/icons-material/PersonAdd';

const StyledAppBar = styled(AppBar)(({ theme }) => ({
  background: 'linear-gradient(45deg, #2196F3 30%, #21CBF3 90%)',
  boxShadow: '0 3px 5px 2px rgba(33, 203, 243, .3)',
}));

const LogoBox = styled(Box)(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  cursor: 'pointer',
  transition: 'transform 0.2s',
  '&:hover': {
    transform: 'scale(1.05)',
  },
}));

const UserAvatar = styled(Avatar)(({ theme }) => ({
  backgroundColor: theme.palette.primary.dark,
  cursor: 'pointer',
  transition: 'transform 0.2s',
  '&:hover': {
    transform: 'scale(1.1)',
  },
}));

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
  const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null);
  
  const handleMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };
  
  const handleMenuClose = () => {
    setAnchorEl(null);
  };
  
  return (
    <AppBar 
      position="static" 
      color="primary" 
      elevation={0}
      sx={{ 
        borderBottom: '1px solid',
        borderColor: 'primary.dark',
        backgroundColor: 'primary.main',
      }}
    >
      <Toolbar>
        <Box sx={{ display: 'flex', alignItems: 'center' }}>
          <LocalFireDepartmentIcon 
            sx={{ 
              mr: 1, 
              color: 'secondary.main',
              fontSize: { xs: 28, sm: 32 }
            }} 
          />
          <Typography 
            variant={isMobile ? "h6" : "h5"} 
            component="h1" 
            sx={{ 
              fontWeight: 700,
              color: 'white',
              letterSpacing: '-0.5px'
            }}
          >
            French Streak
          </Typography>
        </Box>
        
        <Box sx={{ flexGrow: 1 }} />
        
        {streakCount > 0 && (
          <Chip
            icon={<LocalFireDepartmentIcon fontSize="small" />}
            label={`${streakCount} day${streakCount !== 1 ? 's' : ''}`}
            color="secondary"
            sx={{ 
              mr: 2,
              fontWeight: 'bold',
              '& .MuiChip-icon': { color: 'inherit' }
            }}
          />
        )}
        
        {!isLoggedIn ? (
          <>
            {isMobile ? (
              <>
                <IconButton 
                  color="inherit" 
                  onClick={onLoginClick}
                  sx={{ ml: 1 }}
                >
                  <LoginIcon />
                </IconButton>
                <IconButton 
                  color="inherit" 
                  onClick={onRegisterClick}
                  sx={{ ml: 1 }}
                >
                  <PersonAddIcon />
                </IconButton>
              </>
            ) : (
              <>
                <Button 
                  color="inherit" 
                  onClick={onLoginClick}
                  startIcon={<LoginIcon />}
                  sx={{ ml: 1 }}
                >
                  Log In
                </Button>
                <Button 
                  variant="outlined" 
                  color="inherit" 
                  onClick={onRegisterClick}
                  startIcon={<PersonAddIcon />}
                  sx={{ 
                    ml: 1,
                    borderColor: 'rgba(255, 255, 255, 0.5)',
                    '&:hover': {
                      borderColor: 'white',
                      backgroundColor: 'rgba(255, 255, 255, 0.1)'
                    }
                  }}
                >
                  Register
                </Button>
              </>
            )}
          </>
        ) : null}
      </Toolbar>
    </AppBar>
  );
};

export default Header; 