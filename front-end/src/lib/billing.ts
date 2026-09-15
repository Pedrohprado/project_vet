import type { Clinic, User } from '@/types/auth';
import { isSuperAdmin } from '@/types/auth';

const PIX_ACCESS_KEY = 'boxvet:pix-access';

export const SUBSCRIPTION_PRICE = 'R$ 27';

export const SUBSCRIPTION_COMMUNITY_BENEFIT =
  'Comunidade de casos e roadmap público';

export const subscriptionBenefits = [
  'Agenda de consultas e vacinas organizada',
  'Prontuário digital com anamnese e receitas',
  'Lembretes de retorno e vacinação',
  'Pós-consulta para enviar ao tutor',
  SUBSCRIPTION_COMMUNITY_BENEFIT,
] as const;

export type SplashBenefit = {
  text: string;
  highlighted?: boolean;
};

export const splashBenefits: readonly SplashBenefit[] = [
  { text: 'Organize tutores, pets e atendimentos em um só lugar' },
  { text: 'Registre consultas com prontuário digital' },
  { text: 'Acompanhe vacinas e retornos sem esquecer' },
  { text: 'Envie orientações pós-consulta ao tutor' },
  { text: 'Participe da comunidade de veterinários', highlighted: true },
  { text: 'Construa a plataforma pelo roadmap', highlighted: true },
];

function readPixAccessIds(): string[] {
  try {
    const raw = localStorage.getItem(PIX_ACCESS_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as unknown;
    return Array.isArray(parsed)
      ? parsed.filter((id): id is string => typeof id === 'string')
      : [];
  } catch {
    return [];
  }
}

export function hasPixAccess(clinicId: string | null | undefined): boolean {
  if (!clinicId) return false;
  return readPixAccessIds().includes(clinicId);
}

export function markPixAccess(clinicId: string): void {
  const ids = new Set(readPixAccessIds());
  ids.add(clinicId);
  localStorage.setItem(PIX_ACCESS_KEY, JSON.stringify([...ids]));
}

export function hasAppAccess(
  user: User | null | undefined,
  clinic: Clinic | null | undefined,
): boolean {
  if (!user) return false;
  if (isSuperAdmin(user)) return true;
  if (clinic && clinic.plan !== 'FREE') return true;
  if (clinic?.paymentStatus === 'PAID') return true;
  return hasPixAccess(clinic?.id ?? user.clinicId);
}

export function getPostAuthPath(
  user: User | null | undefined,
  clinic: Clinic | null | undefined,
): string {
  if (!user) return '/login';
  if (isSuperAdmin(user)) return '/admin';
  if (hasAppAccess(user, clinic)) return '/estatisticas';
  return '/assinatura';
}

export function firstName(fullName: string | null | undefined): string {
  const name = fullName?.trim();
  if (!name) return 'Olá';
  return name.split(/\s+/)[0] ?? name;
}
