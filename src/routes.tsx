import { createBrowserRouter } from 'react-router-dom';
import GuestPage from './pages/GuestPage';
import ProtocolPage from './pages/ProtocolPage';
import AdminPage from './pages/AdminPage';
import AdminGuestDetails from './pages/adminDetails';
import ProtocolDetailsPage from './pages/ProtocoloDetails';
import QuizPage from './pages/quiz';
import HomePage from './pages/home';
import ProtectedRoute from './components/protectRoute';
import AdminLayout from './layout/adminlayout';
import ProtocoloLayout from './layout/protocololayout';
import GuestLayout from './layout/guestlayout';


const router = createBrowserRouter([
  { path: '/', element: <HomePage /> },

  {
    path: '/admin',
    element: (
      <ProtectedRoute role="admin">
        <AdminLayout>
          <AdminPage />
        </AdminLayout>
      </ProtectedRoute>
    ),
  },
  {
    path: '/admin/:id',
    element: (
      <ProtectedRoute role="admin">
        <AdminLayout>
          <AdminGuestDetails />
        </AdminLayout>
      </ProtectedRoute>
    ),
  },
  {
    path: '/protocolo',
    element: (
      <ProtectedRoute role="protocolo">
        <ProtocoloLayout>
          <ProtocolPage />
        </ProtocoloLayout>
      </ProtectedRoute>
    ),
  },
  {
    path: '/protocolo/:id',
    element: (
      <ProtectedRoute role="protocolo">
        <ProtocoloLayout>
          <ProtocolDetailsPage />
        </ProtocoloLayout>
      </ProtectedRoute>
    ),
  },
  {
    path: '/convidado/:id',
    element: (
      <GuestLayout>
        <GuestPage />
      </GuestLayout>
    ),
  },
  {
    path: '/quiz',
    element: (
      <GuestLayout>
        <QuizPage />
      </GuestLayout>
    ),
  },
]);

export default router;
