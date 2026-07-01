export type ClinicPlan = 'FREE' | 'STARTER' | 'PRO';

export type UserRole = 'VETERINARIAN' | 'ADMIN';

export type Clinic = {
  id: string;
  name: string;
  document: string | null;
  phone: string | null;
  whatsapp: string | null;
  email: string | null;
  plan: ClinicPlan;
  isActive: boolean;
  createdAt: string;
};

export type User = {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  clinicId: string;
  phone: string | null;
  crmv: string | null;
  isActive: boolean;
  lastLoginAt: string | null;
  createdAt: string;
};

export type RegisterClinicPayload = {
  clinicName: string;
  document: string;
  phone: string;
  email: string;
  password: string;
  name: string;
};

export type AuthResponse = {
  user: User;
  clinic: Clinic;
};
