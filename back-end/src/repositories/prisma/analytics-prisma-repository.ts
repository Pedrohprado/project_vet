import { prisma } from '../../lib/prisma.js';
import { FunnelStep, UserRole } from '../../generated/prisma/client.js';
import { pickDefined } from '../../lib/pick-defined.js';
import type { TrackFunnelEventInput } from '../../https/schemas/analytics-schema.js';

const registeredUsersWhere = {
  clinicId: { not: null },
  role: { in: [UserRole.VETERINARIAN, UserRole.ADMIN] as UserRole[] },
};

export class AnalyticsPrismaRepository {
  async createEvent(data: TrackFunnelEventInput) {
    return prisma.funnelEvent.create({
      data: {
        step: data.step as FunnelStep,
        path: data.path,
        ...pickDefined({ sessionId: data.sessionId }),
      },
    });
  }

  async getPublicStats() {
    const [registeredUsers, entrada, checkout, entered] = await Promise.all([
      prisma.user.count({ where: registeredUsersWhere }),
      prisma.funnelEvent.count({ where: { step: FunnelStep.ENTRADA } }),
      prisma.funnelEvent.count({ where: { step: FunnelStep.CHECKOUT } }),
      prisma.funnelEvent.count({ where: { step: FunnelStep.ENTERED } }),
    ]);

    return {
      registeredUsers,
      entrada,
      checkout,
      entered,
    };
  }
}
