import { Navigate, Outlet } from 'react-router';
import { useAuth } from '@/hooks/useAuth';

export function ProtectedRoute() {
  const { isAuthenticated, isLoading } = useAuth();

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

  return <Outlet />;
}

export function GuestRoute() {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="flex min-h-svh items-center justify-center px-4 py-6 text-muted-foreground">
        Carregando...
      </div>
    );
  }

  if (isAuthenticated) {
    return <Navigate to="/estatisticas" replace />;
  }

  return <Outlet />;
}

export function getAuthenticatedHome() {
  return '/estatisticas';
}
