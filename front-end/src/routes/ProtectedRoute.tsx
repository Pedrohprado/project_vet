import { Navigate, Outlet } from 'react-router';
import { useAuth } from '@/hooks/useAuth';
import { getPostAuthPath, hasAppAccess } from '@/lib/billing';
import { isSuperAdmin } from '@/types/auth';

export function ProtectedRoute() {
  const { isAuthenticated, isLoading, user, clinic } = useAuth();

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

  if (!hasAppAccess(user, clinic)) {
    return <Navigate to="/assinatura" replace />;
  }

  return <Outlet />;
}

export function SubscriptionRoute() {
  const { isAuthenticated, isLoading, user, clinic } = useAuth();

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

  if (hasAppAccess(user, clinic)) {
    return <Navigate to="/estatisticas" replace />;
  }

  return <Outlet />;
}

export function SuperAdminRoute() {
  const { isAuthenticated, isLoading, user, clinic } = useAuth();

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
    return <Navigate to={getPostAuthPath(user, clinic)} replace />;
  }

  return <Outlet />;
}

export function GuestRoute() {
  const { isAuthenticated, isLoading, user, clinic } = useAuth();

  if (isLoading) {
    return (
      <div className="flex min-h-svh items-center justify-center px-4 py-6 text-muted-foreground">
        Carregando...
      </div>
    );
  }

  if (isAuthenticated) {
    return <Navigate to={getPostAuthPath(user, clinic)} replace />;
  }

  return <Outlet />;
}

/** @deprecated Prefer getPostAuthPath(user, clinic) when clinic is available. */
export function getAuthenticatedHome(user?: { role: string } | null) {
  if (user?.role === 'SUPER_ADMIN') {
    return '/admin';
  }

  return '/estatisticas';
}
