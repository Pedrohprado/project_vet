import { Navigate, Outlet } from 'react-router';
import { useAuth } from '@/hooks/useAuth';
import { isSuperAdmin } from '@/types/auth';

export function ProtectedRoute() {
  const { isAuthenticated, isLoading, user } = useAuth();

  if (isLoading) {
    return (
      <div className="flex min-h-svh items-center justify-center px-4 py-6 text-muted-foreground">
        Carregando...
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (isSuperAdmin(user)) {
    return <Navigate to="/admin" replace />;
  }

  return <Outlet />;
}

export function SuperAdminRoute() {
  const { isAuthenticated, isLoading, user } = useAuth();

  if (isLoading) {
    return (
      <div className="flex min-h-svh items-center justify-center px-4 py-6 text-muted-foreground">
        Carregando...
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (!isSuperAdmin(user)) {
    return <Navigate to="/estatisticas" replace />;
  }

  return <Outlet />;
}

export function GuestRoute() {
  const { isAuthenticated, isLoading, user } = useAuth();

  if (isLoading) {
    return (
      <div className="flex min-h-svh items-center justify-center px-4 py-6 text-muted-foreground">
        Carregando...
      </div>
    );
  }

  if (isAuthenticated) {
    return <Navigate to={getAuthenticatedHome(user)} replace />;
  }

  return <Outlet />;
}

export function getAuthenticatedHome(user?: { role: string } | null) {
  if (user?.role === 'SUPER_ADMIN') {
    return '/admin';
  }

  return '/estatisticas';
}
