import { Box, CircularProgress } from '@mui/material';
import { AuthProvider, useAuth } from './components/AuthProvider';
import { AuthPage } from './components/AuthPage';
import { RouterProvider } from 'react-router';
import { router } from './routes';

function AppContent() {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <Box
        sx={{
          minHeight: '100vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <CircularProgress />
      </Box>
    );
  }

  if (!user) {
    return <AuthPage onAuthSuccess={() => window.location.reload()} />;
  }

  return <RouterProvider router={router} />;
}

export default function AppWithAuth() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}
