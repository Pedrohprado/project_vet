import { Navigate, Route, Routes } from 'react-router';
import { Toaster } from 'sonner';
import { AppLayout } from '@/components/layout/AppLayout';
import { AuthProvider } from '@/contexts/AuthContext';
import { useAuth } from '@/hooks/useAuth';
import { AtendimentoPage } from '@/pages/AtendimentoPage';
import { AgendaPage } from '@/pages/AgendaPage';
import { AppointmentFormPage } from '@/pages/AppointmentFormPage';
import { ConsultationPage } from '@/pages/ConsultationPage';
import { VaccinationPage } from '@/pages/VaccinationPage';
import { AuthPage } from '@/pages/AuthPage';
import { EstatisticasPage } from '@/pages/EstatisticasPage';
import { LandingPage } from '@/pages/LandingPage';
import { PetDetailPage } from '@/pages/PetDetailPage';
import { PetFormPage } from '@/pages/PetFormPage';
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

  if (isAuthenticated) {
    return <Navigate to="/estatisticas" replace />;
  }

  return <LandingPage />;
}

function App() {
  return (
    <>
      <Routes>
        <Route path="/" element={<RootRedirect />} />

        <Route element={<GuestRoute />}>
          <Route path="/login" element={<AuthPage />} />
          <Route path="/register" element={<AuthPage />} />
        </Route>

        <Route element={<ProtectedRoute />}>
          <Route element={<AppLayout />}>
            <Route path="/estatisticas" element={<EstatisticasPage />} />
            <Route path="/agenda" element={<AgendaPage />} />
            <Route path="/atendimento" element={<AtendimentoPage />} />
            <Route path="/tutors" element={<TutorListPage />} />
            <Route path="/tutors/new" element={<TutorFormPage />} />
            <Route path="/tutors/:id" element={<TutorDetailPage />} />
            <Route path="/tutors/:id/pets/new" element={<PetFormPage />} />
            <Route path="/tutors/:id/pets/:petId" element={<PetDetailPage />} />
            <Route path="/appointments/new" element={<AppointmentFormPage />} />
            <Route path="/consultations/:id" element={<ConsultationPage />} />
            <Route path="/vaccinations/:id" element={<VaccinationPage />} />
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
