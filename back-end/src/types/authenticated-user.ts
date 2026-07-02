import type { UserRole } from '../generated/prisma/client.js';

export type AuthenticatedUser = {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  clinicId: string | null;
};
