import { Navigate, Outlet, useLocation, useOutletContext } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export function ProtectedRoute() {
  const { isAuthenticated } = useAuth();
  const location = useLocation();
  const outletContext = useOutletContext();
  if (!isAuthenticated) {
    return <Navigate to="/login" replace state={{ from: location }} />;
  }
  return <Outlet context={outletContext} />;
}

export function GuestOnlyRoute() {
  const { isAuthenticated } = useAuth();
  if (isAuthenticated) {
    return <Navigate to="/" replace />;
  }
  return <Outlet />;
}

export function AdminRoute({ forbidden }) {
  const { currentUser } = useAuth();
  const outletContext = useOutletContext();
  if (currentUser?.role !== 'ADMIN') {
    return forbidden;
  }
  return <Outlet context={outletContext} />;
}
