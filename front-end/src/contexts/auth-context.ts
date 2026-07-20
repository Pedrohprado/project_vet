import { createContext } from 'react';
import type {
  AuthResponse,
  Clinic,
  RegisterClinicPayload,
  UpdateProfilePayload,
  User,
} from '@/types/auth';

export type AuthContextValue = {
  user: User | null;
  clinic: Clinic | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  isFirstAccess: boolean;
  login: (email: string, password: string) => Promise<AuthResponse>;
  register: (payload: RegisterClinicPayload) => Promise<AuthResponse>;
  completeWelcome: () => Promise<void>;
  updateProfile: (payload: UpdateProfilePayload) => Promise<void>;
  saveSignature: (signature: string) => Promise<void>;
  deleteSignature: () => Promise<void>;
  logout: () => Promise<void>;
};

export const AuthContext = createContext<AuthContextValue | null>(null);
