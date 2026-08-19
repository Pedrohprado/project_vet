import type { User } from '@/types/auth';
import { isSuperAdmin } from '@/types/auth';

export function getCommunityBasePath(user: User | null | undefined): string {
  return isSuperAdmin(user) ? '/admin/comunidade' : '/comunidade';
}

export function getCommunityCasePath(
  user: User | null | undefined,
  caseId?: string | null,
): string {
  const base = getCommunityBasePath(user);
  return caseId ? `${base}?caso=${caseId}` : base;
}
