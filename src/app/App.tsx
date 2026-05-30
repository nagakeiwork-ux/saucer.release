import { RouterProvider } from 'react-router';
import { router } from './routes-with-data';

// デモモード: Supabase設定なしで動作
export default function App() {
  return <RouterProvider router={router} />;
}
