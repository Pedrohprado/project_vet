import { Navigate, useParams } from 'react-router';
import { useAuth } from '@/hooks/useAuth';
import { getCommunityCasePath } from '@/lib/community-paths';

/** Deep links antigos redirecionam para o feed; o detalhe abre em modal. */
export function CommunityCasePage() {
  const { caseId } = useParams<{ caseId: string }>();
  const { user } = useAuth();

  return (
    <Navigate to={getCommunityCasePath(user, caseId)} replace />
  );
}
