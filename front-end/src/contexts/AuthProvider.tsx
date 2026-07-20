import {
  useCallback,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react';
import * as authApi from '@/api/auth';
import { ApiError } from '@/api/http';
import {
  AuthContext,
  type AuthContextValue,
} from '@/contexts/auth-context';
import { clearAllConsultationDrafts } from '@/lib/consultation-draft';
import type { RegisterClinicPayload, UpdateProfilePayload } from '@/types/auth';

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthContextValue['user']>(null);
  const [clinic, setClinic] = useState<AuthContextValue['clinic']>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;

    async function bootstrap() {
      try {
        const data = await authApi.getMe();
        if (!cancelled) {
          setUser(data.user);
          setClinic(data.clinic);
        }
      } catch (error) {
        if (!cancelled && !(error instanceof ApiError && error.statusCode === 401)) {
          console.error('Failed to restore session', error);
        }
      } finally {
        if (!cancelled) {
          setIsLoading(false);
        }
      }
    }

    void bootstrap();

    return () => {
      cancelled = true;
    };
  }, []);

  const login = useCallback(async (email: string, password: string) => {
    const data = await authApi.login(email, password);
    setUser(data.user);
    setClinic(data.clinic);
    return data;
  }, []);

  const register = useCallback(async (payload: RegisterClinicPayload) => {
    const data = await authApi.registerClinic(payload);
    setUser(data.user);
    setClinic(data.clinic);
    return data;
  }, []);

  const completeWelcome = useCallback(async () => {
    const data = await authApi.completeWelcome();
    setUser(data.user);
    setClinic(data.clinic);
  }, []);

  const updateProfile = useCallback(async (payload: UpdateProfilePayload) => {
    const data = await authApi.updateProfile(payload);
    setUser(data.user);
    setClinic(data.clinic);
  }, []);

  const saveSignature = useCallback(async (signature: string) => {
    const data = await authApi.saveSignature(signature);
    setUser(data.user);
    setClinic(data.clinic);
  }, []);

  const deleteSignature = useCallback(async () => {
    const data = await authApi.deleteSignature();
    setUser(data.user);
    setClinic(data.clinic);
  }, []);

  const logout = useCallback(async () => {
    try {
      await authApi.logout();
    } catch (error) {
      console.error('Failed to logout', error);
    } finally {
      clearAllConsultationDrafts();
      setUser(null);
      setClinic(null);
    }
  }, []);

  const value = useMemo<AuthContextValue>(
    () => ({
      user,
      clinic,
      isLoading,
      isAuthenticated: user !== null,
      isFirstAccess: user !== null && user.lastLoginAt === null,
      login,
      register,
      completeWelcome,
      updateProfile,
      saveSignature,
      deleteSignature,
      logout,
    }),
    [user, clinic, isLoading, login, register, completeWelcome, updateProfile, saveSignature, deleteSignature, logout],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
