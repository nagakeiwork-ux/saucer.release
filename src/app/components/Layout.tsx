import { Outlet, Link, useLocation } from 'react-router';
import {
  AppBar,
  Toolbar,
  Container,
  Box,
  IconButton,
  BottomNavigation,
  BottomNavigationAction,
  Paper,
} from '@mui/material';
import {
  Home as HomeIcon,
  People as PeopleIcon,
  Person as PersonIcon,
} from '@mui/icons-material';
import logoImg from '../../imports/IMG_6885.jpeg';

export function Layout() {
  const location = useLocation();

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: '#fafafa', pb: 8 }}>
      <AppBar position="sticky" sx={{ bgcolor: 'white', color: '#2d3748' }} elevation={1}>
        <Toolbar>
          <Box
            component="img"
            src={logoImg}
            alt="Non-trivial Logo"
            sx={{
              height: 40,
              width: 40,
              mr: 1.5,
              objectFit: 'contain',
            }}
          />
          <Box sx={{ fontSize: '1.25rem', fontWeight: 600, flexGrow: 1 }}>
            Saucer
          </Box>
          <IconButton component={Link} to="/profile">
            <PersonIcon />
          </IconButton>
        </Toolbar>
      </AppBar>

      <Container maxWidth="md" sx={{ py: 3 }}>
        <Outlet />
      </Container>

      <Paper
        sx={{ position: 'fixed', bottom: 0, left: 0, right: 0, zIndex: 1000 }}
        elevation={3}
      >
        <BottomNavigation value={location.pathname} showLabels>
          <BottomNavigationAction
            label="ホーム"
            value="/"
            icon={<HomeIcon />}
            component={Link}
            to="/"
            sx={{
              '&.Mui-selected': { color: '#6366f1' },
            }}
          />
          <BottomNavigationAction
            label="読者"
            value="/resonators"
            icon={<PeopleIcon />}
            component={Link}
            to="/resonators"
            sx={{
              '&.Mui-selected': { color: '#6366f1' },
            }}
          />
          <BottomNavigationAction
            label="プロフィール"
            value="/profile"
            icon={<PersonIcon />}
            component={Link}
            to="/profile"
            sx={{
              '&.Mui-selected': { color: '#6366f1' },
            }}
          />
        </BottomNavigation>
      </Paper>
    </Box>
  );
}
