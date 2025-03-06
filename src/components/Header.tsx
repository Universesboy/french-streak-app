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
  Avatar
} from '@mui/material';
import TranslateIcon from '@mui/icons-material/Translate';
import MenuIcon from '@mui/icons-material/Menu';
import PersonIcon from '@mui/icons-material/Person';
import SettingsIcon from '@mui/icons-material/Settings';
import InfoIcon from '@mui/icons-material/Info';

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

const Header: React.FC = () => {
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
    <StyledAppBar position="static">
      <Container maxWidth="lg">
        <Toolbar sx={{ p: isMobile ? 1 : 2, justifyContent: 'space-between' }}>
          <LogoBox>
            <TranslateIcon sx={{ 
              mr: 2, 
              fontSize: isMobile ? 24 : 32,
              color: '#fff'
            }} />
            <Box>
              <Typography variant={isMobile ? "h6" : "h5"} component="h1" sx={{ fontWeight: 'bold' }}>
                French Learning Streak
              </Typography>
              <Typography 
                variant={isMobile ? "caption" : "subtitle2"} 
                component="div" 
                sx={{ 
                  opacity: 0.8,
                  display: { xs: 'none', sm: 'block' }
                }}
              >
                Track your progress & earn rewards
              </Typography>
            </Box>
          </LogoBox>
          
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <UserAvatar>
              <PersonIcon />
            </UserAvatar>
            
            <IconButton 
              color="inherit" 
              edge="end" 
              onClick={handleMenuOpen}
              sx={{ ml: 1 }}
            >
              <MenuIcon />
            </IconButton>
            
            <Menu
              anchorEl={anchorEl}
              open={Boolean(anchorEl)}
              onClose={handleMenuClose}
              PaperProps={{
                elevation: 3,
                sx: { 
                  mt: 1.5,
                  minWidth: 180,
                  borderRadius: 2,
                  '& .MuiMenuItem-root': {
                    px: 2,
                    py: 1.5,
                    borderRadius: 1,
                    my: 0.5,
                    mx: 1
                  },
                }
              }}
            >
              <MenuItem onClick={handleMenuClose}>
                <SettingsIcon sx={{ mr: 2, color: theme.palette.primary.main }} />
                Settings
              </MenuItem>
              <MenuItem onClick={handleMenuClose}>
                <InfoIcon sx={{ mr: 2, color: theme.palette.info.main }} />
                About
              </MenuItem>
            </Menu>
          </Box>
        </Toolbar>
      </Container>
    </StyledAppBar>
  );
};

export default Header; 