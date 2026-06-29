import { AuthSplitLayout } from '@/components/auth/auth-split-layout';
import { LoginForm } from '@/components/auth/login-form';

export function LoginPage() {
  return (
    <AuthSplitLayout mode="login">
      <LoginForm />
    </AuthSplitLayout>
  );
}
