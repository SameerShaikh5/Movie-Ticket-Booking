import { createBrowserRouter, Navigate, RouterProvider } from 'react-router';
import { Toaster } from 'react-hot-toast';
import RootLayout from './layouts/RootLayout.jsx';
import ProtectedAdminRoute from './components/ProtectedAdminRoute.jsx';
import ErrorPage from './pages/ErrorPage.jsx';
import Home from './pages/Home.jsx';
import ShowDetails from './pages/ShowDetails.jsx';
import SeatSelection from './pages/SeatSelection.jsx';
import UserProfile from './pages/UserProfile.jsx';
import AdminLayout from './pages/admins/AdminLayout.jsx';
import AnalyticsView from './pages/admins/AnalyticsView.jsx';
import ShowtimesView from './pages/admins/ShowtimesView.jsx';
import ScreenConfigView from './pages/admins/ScreenConfigView.jsx';
import PaymentSuccess from './pages/PaymentSuccess.jsx';
import PaymentFailure from './pages/PaymentFailure.jsx';

const router = createBrowserRouter([
  {
    path: '/',
    element: <RootLayout />,
    errorElement: <ErrorPage />,
    children: [
      {
        index: true,
        element: <Home />,
      },
      {
        path: 'show/:id',
        element: <ShowDetails />,
      },
      {
        path: 'select-seats/:id',
        element: <SeatSelection />,
      },
      {
        path: 'profile',
        element: <UserProfile />,
      },
      {
        path: 'bookings/success',
        element: <PaymentSuccess />,
      },
      {
        path: 'bookings/failure',
        element: <PaymentFailure />,
      },
    ],
  },
  {
    path: '/admin',
    element: <ProtectedAdminRoute />,
    errorElement: <ErrorPage />,
    children: [
      {
        element: <AdminLayout />,
        children: [
          {
            index: true,
            element: <Navigate to="analytics" replace />,
          },
          {
            path: 'analytics',
            element: <AnalyticsView />,
          },
          {
            path: 'shows',
            element: <ShowtimesView />,
          },
          {
            path: 'screens',
            element: <ScreenConfigView />,
          },
        ],
      },
    ],
  },
  {
    path: '*',
    element: <ErrorPage />,
  },
]);

export default function App() {
  return (
    <>
      <Toaster position="top-right" />
      <RouterProvider router={router} />
    </>
  );
}