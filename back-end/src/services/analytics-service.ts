import { AnalyticsPrismaRepository } from '../repositories/prisma/analytics-prisma-repository.js';
import type { TrackFunnelEventInput } from '../https/schemas/analytics-schema.js';

const analyticsRepository = new AnalyticsPrismaRepository();

export class AnalyticsService {
  async trackEvent(input: TrackFunnelEventInput) {
    await analyticsRepository.createEvent(input);
    return { ok: true as const };
  }

  async getPublicStats() {
    return analyticsRepository.getPublicStats();
  }
}
