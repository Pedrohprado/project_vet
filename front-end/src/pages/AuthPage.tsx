import { useLocation } from 'react-router';
import { AuthPageLayout } from '@/components/auth/auth-page-layout';
import { LoginForm } from '@/components/auth/login-form';
import { RegisterForm } from '@/components/auth/register-form';
import { useDocumentSeo } from '@/hooks/use-document-seo';
import { useFunnelTrack } from '@/hooks/useFunnelTrack';
import { authSeo, registerSeo } from '@/lib/seo';

export function AuthPage() {
  const location = useLocation();
  const isRegister = location.pathname === '/register';
  useFunnelTrack('ENTRADA');
  useDocumentSeo(isRegister ? registerSeo : authSeo);

  return (
    <AuthPageLayout
      isRegister={isRegister}
      subtitle={
        isRegister
          ? 'Cadastre sua clínica e comece a gerenciar seus atendimentos.'
          : 'Preencha os campos para acessar sua clínica.'
      }
    >
      {isRegister ? <RegisterForm /> : <LoginForm />}
    </AuthPageLayout>
  );
}
