import { createBrowserRouter } from 'react-router';
import { Layout } from './components/Layout';
import { HomePage } from './components/HomePage';
import { ResonatorsPage } from './components/ResonatorsPage';
import { ProfilePage } from './components/ProfilePage';
import { UserProfilePage } from './components/UserProfilePage';

export const router = createBrowserRouter([
  {
    path: '/',
    Component: Layout,
    children: [
      { index: true, Component: HomePage },
      { path: 'resonators', Component: ResonatorsPage },
      { path: 'profile', Component: ProfilePage },
      { path: 'user/:userId', Component: UserProfilePage },
    ],
  },
]);
