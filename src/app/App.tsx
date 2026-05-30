import { RouterProvider } from 'react-router';
import { router } from './routes-with-data';
import { AuthProvider } from '../hooks/useAuth';

export default function App() {
  return (
    <AuthProvider>
      <RouterProvider router={router} />
    </AuthProvider>
  );
}