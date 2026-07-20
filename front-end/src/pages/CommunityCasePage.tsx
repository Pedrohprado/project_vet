import { Navigate, useParams } from 'react-router';

/** Deep links antigos redirecionam para o feed; o detalhe abre em modal. */
export function CommunityCasePage() {
  const { caseId } = useParams<{ caseId: string }>();
  return (
    <Navigate
      to={caseId ? `/comunidade?caso=${caseId}` : '/comunidade'}
      replace
    />
  );
}
