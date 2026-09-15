export type ClinicPlan = 'FREE' | 'STARTER' | 'PRO';

export type PaymentMethod = 'NONE' | 'PIX' | 'CARD';

export type PaymentStatus = 'PENDING' | 'PAID';

export type UserRole = 'VETERINARIAN' | 'ADMIN' | 'SUPER_ADMIN';

export const USER_ROLE_LABELS: Record<UserRole, string> = {
  VETERINARIAN: 'Veterinário',
  ADMIN: 'Administrador da clínica',
  SUPER_ADMIN: 'Administrador da plataforma',
};

export type Clinic = {
  id: string;
  name: string;
  document: string | null;
  phone: string | null;
  whatsapp: string | null;
  email: string | null;
  plan: ClinicPlan;
  isActive: boolean;
  paymentMethod: PaymentMethod;
  paymentStatus: PaymentStatus;
  createdAt: string;
};

export type User = {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  clinicId: string | null;
  phone: string | null;
  crmv: string | null;
  signatureUrl: string | null;
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

export type UpdateProfilePayload = {
  crmv?: string | null;
  phone?: string | null;
};

export type AuthResponse = {
  user: User;
  clinic: Clinic | null;
};

export function isSuperAdmin(user: User | null | undefined): boolean {
  return user?.role === 'SUPER_ADMIN';
}
