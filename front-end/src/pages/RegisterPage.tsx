import { AuthSplitLayout } from '@/components/auth/auth-split-layout';
import { RegisterForm } from '@/components/auth/register-form';

export function RegisterPage() {
  return (
    <AuthSplitLayout mode="register">
      <RegisterForm />
    </AuthSplitLayout>
  );
}
