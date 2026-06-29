import {
  createContext,
  useCallback,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react';
import * as authApi from '@/api/auth';
import { ApiError } from '@/api/http';
import type { Clinic, RegisterClinicPayload, User } from '@/types/auth';

type AuthContextValue = {
  user: User | null;
  clinic: Clinic | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (payload: RegisterClinicPayload) => Promise<void>;
  logout: () => Promise<void>;
};

export const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [clinic, setClinic] = useState<Clinic | null>(null);
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
  }, []);

  const register = useCallback(async (payload: RegisterClinicPayload) => {
    const data = await authApi.registerClinic(payload);
    setUser(data.user);
    setClinic(data.clinic);
  }, []);

  const logout = useCallback(async () => {
    try {
      await authApi.logout();
    } catch (error) {
      console.error('Failed to logout', error);
    } finally {
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
      login,
      register,
      logout,
    }),
    [user, clinic, isLoading, login, register, logout],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
