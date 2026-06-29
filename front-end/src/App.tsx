import { Navigate, Route, Routes } from 'react-router';
import { Toaster } from 'sonner';
import { AppLayout } from '@/components/layout/AppLayout';
import { AuthProvider } from '@/contexts/AuthContext';
import { useAuth } from '@/hooks/useAuth';
import { AtendimentoPage } from '@/pages/AtendimentoPage';
import { AppointmentFormPage } from '@/pages/AppointmentFormPage';
import { ConsultationPage } from '@/pages/ConsultationPage';
import { LoginPage } from '@/pages/LoginPage';
import { PetDetailPage } from '@/pages/PetDetailPage';
import { PetFormPage } from '@/pages/PetFormPage';
import { RegisterPage } from '@/pages/RegisterPage';
import { TutorDetailPage } from '@/pages/TutorDetailPage';
import { TutorFormPage } from '@/pages/TutorFormPage';
import { TutorListPage } from '@/pages/TutorListPage';
import { GuestRoute, ProtectedRoute } from '@/routes/ProtectedRoute';

function RootRedirect() {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="flex min-h-svh items-center justify-center text-muted-foreground">
        Carregando...
      </div>
    );
  }

  return (
    <Navigate to={isAuthenticated ? '/atendimento' : '/login'} replace />
  );
}

function App() {
  return (
    <>
      <Routes>
        <Route path="/" element={<RootRedirect />} />

        <Route element={<GuestRoute />}>
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
        </Route>

        <Route element={<ProtectedRoute />}>
          <Route element={<AppLayout />}>
            <Route path="/atendimento" element={<AtendimentoPage />} />
            <Route path="/tutors" element={<TutorListPage />} />
            <Route path="/tutors/new" element={<TutorFormPage />} />
            <Route path="/tutors/:id" element={<TutorDetailPage />} />
            <Route path="/tutors/:id/pets/new" element={<PetFormPage />} />
            <Route path="/tutors/:id/pets/:petId" element={<PetDetailPage />} />
            <Route path="/appointments/new" element={<AppointmentFormPage />} />
            <Route path="/consultations/:id" element={<ConsultationPage />} />
          </Route>
        </Route>
      </Routes>
      <Toaster richColors position="top-right" />
    </>
  );
}

function AppWithProviders() {
  return (
    <AuthProvider>
      <App />
    </AuthProvider>
  );
}

export default AppWithProviders;
