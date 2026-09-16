import { useCallback, useState } from 'react';
import { useLocation } from 'react-router';
import { AuthPageLayout } from '@/components/auth/auth-page-layout';
import {
  ForgotPasswordForm,
  type ForgotPasswordStep,
} from '@/components/auth/forgot-password-form';
import { LoginForm } from '@/components/auth/login-form';
import { RegisterForm } from '@/components/auth/register-form';
import { useDocumentSeo } from '@/hooks/use-document-seo';
import { useFunnelTrack } from '@/hooks/useFunnelTrack';
import { authSeo, forgotPasswordSeo, registerSeo } from '@/lib/seo';

export function AuthPage() {
  const location = useLocation();
  const isRegister = location.pathname === '/register';
  const isForgotPassword = location.pathname === '/forgot-password';
  const [forgotStep, setForgotStep] = useState<ForgotPasswordStep>('email');
  const handleForgotStepChange = useCallback((step: ForgotPasswordStep) => {
    setForgotStep(step);
  }, []);

  useFunnelTrack('ENTRADA');
  useDocumentSeo(
    isRegister ? registerSeo : isForgotPassword ? forgotPasswordSeo : authSeo,
  );

  const isCodeStep = isForgotPassword && forgotStep === 'code';

  const subtitle = isCodeStep
    ? null
    : isForgotPassword
      ? 'Informe seu e-mail para receber um código e criar uma nova senha.'
      : null;

  return (
    <AuthPageLayout
      isRegister={isRegister}
      subtitle={subtitle}
      showEyebrow={false}
    >
      {isRegister ? (
        <RegisterForm />
      ) : isForgotPassword ? (
        <ForgotPasswordForm onStepChange={handleForgotStepChange} />
      ) : (
        <LoginForm />
      )}
    </AuthPageLayout>
  );
}
