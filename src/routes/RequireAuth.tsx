import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '@/hooks/AuthProvider';

export function RequireAuth() {
  const { user, isLoading } = useAuth();

  if (isLoading) {
    return null; // 또는 로딩 스피너
  }

  if (!user) {
    return <Navigate to="/" state={{ showLogin: true }} replace />;
  }

  return <Outlet />;
}
