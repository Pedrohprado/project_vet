import { prisma } from '../../lib/prisma.js';
import { ConsultationStatus, UserRole } from '../../generated/prisma/client.js';
import type {
  ListPlatformClinicsQuery,
  ListPlatformTutorsQuery,
  ListPlatformVeterinariansQuery,
} from '../../https/schemas/platform-schema.js';

const veterinarianWhere = {
  clinicId: { not: null },
  role: { in: [UserRole.VETERINARIAN, UserRole.ADMIN] as UserRole[] },
};

export class PlatformPrismaRepository {
  async getStats() {
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const [
      clinicsActive,
      clinicsInactive,
      tutors,
      pets,
      veterinariansTotal,
      veterinariansActive,
      veterinariansRecentLogin,
      consultationsFinished,
      communityCases,
      communityLikes,
      communityComments,
    ] = await Promise.all([
      prisma.clinic.count({ where: { isActive: true } }),
      prisma.clinic.count({ where: { isActive: false } }),
      prisma.tutor.count(),
      prisma.pet.count(),
      prisma.user.count({ where: veterinarianWhere }),
      prisma.user.count({ where: { ...veterinarianWhere, isActive: true } }),
      prisma.user.count({
        where: {
          ...veterinarianWhere,
          lastLoginAt: { gte: thirtyDaysAgo },
        },
      }),
      prisma.consultation.count({
        where: { status: ConsultationStatus.FINISHED },
      }),
      prisma.communityCase.count(),
      prisma.communityCaseLike.count(),
      prisma.communityCaseComment.count(),
    ]);

    return {
      clinicsActive,
      clinicsInactive,
      clinicsTotal: clinicsActive + clinicsInactive,
      tutors,
      pets,
      veterinariansTotal,
      veterinariansActive,
      veterinariansRecentLogin,
      consultationsFinished,
      communityCases,
      communityLikes,
      communityComments,
    };
  }

  async findClinics(query: ListPlatformClinicsQuery) {
    const where = {
      ...(query.status === 'active'
        ? { isActive: true }
        : query.status === 'inactive'
          ? { isActive: false }
          : {}),
      ...(query.q
        ? {
            OR: [
              { name: { contains: query.q, mode: 'insensitive' as const } },
              { email: { contains: query.q, mode: 'insensitive' as const } },
              { document: { contains: query.q } },
              { phone: { contains: query.q } },
            ],
          }
        : {}),
    };

    const [items, total] = await Promise.all([
      prisma.clinic.findMany({
        where,
        select: {
          id: true,
          name: true,
          document: true,
          phone: true,
          email: true,
          plan: true,
          isActive: true,
          paymentMethod: true,
          paymentStatus: true,
          createdAt: true,
          _count: {
            select: {
              tutors: true,
              pets: true,
              users: true,
            },
          },
        },
        orderBy: { createdAt: 'desc' },
        skip: (query.page - 1) * query.limit,
        take: query.limit,
      }),
      prisma.clinic.count({ where }),
    ]);

    return {
      items: items.map((clinic) => ({
        id: clinic.id,
        name: clinic.name,
        document: clinic.document,
        phone: clinic.phone,
        email: clinic.email,
        plan: clinic.plan,
        isActive: clinic.isActive,
        paymentMethod: clinic.paymentMethod,
        paymentStatus: clinic.paymentStatus,
        createdAt: clinic.createdAt,
        tutorsCount: clinic._count.tutors,
        petsCount: clinic._count.pets,
        usersCount: clinic._count.users,
      })),
      total,
      page: query.page,
      limit: query.limit,
    };
  }

  async updateClinic(
    id: string,
    data: {
      isActive?: boolean;
      paymentMethod?: 'NONE' | 'PIX' | 'CARD';
      paymentStatus?: 'PENDING' | 'PAID';
    },
  ) {
    return prisma.clinic.update({
      where: { id },
      data: {
        ...(data.isActive !== undefined ? { isActive: data.isActive } : {}),
        ...(data.paymentMethod !== undefined
          ? { paymentMethod: data.paymentMethod }
          : {}),
        ...(data.paymentStatus !== undefined
          ? { paymentStatus: data.paymentStatus }
          : {}),
      },
      select: {
        id: true,
        name: true,
        isActive: true,
        paymentMethod: true,
        paymentStatus: true,
        plan: true,
      },
    });
  }

  async updateClinicStatus(id: string, isActive: boolean) {
    return this.updateClinic(id, { isActive });
  }

  async findTutors(query: ListPlatformTutorsQuery) {
    const where = query.q
      ? {
          OR: [
            { name: { contains: query.q, mode: 'insensitive' as const } },
            { email: { contains: query.q, mode: 'insensitive' as const } },
            { phone: { contains: query.q } },
            { whatsapp: { contains: query.q } },
            { document: { contains: query.q } },
          ],
        }
      : {};

    const [items, total] = await Promise.all([
      prisma.tutor.findMany({
        where,
        select: {
          id: true,
          name: true,
          phone: true,
          whatsapp: true,
          email: true,
          createdAt: true,
          clinic: {
            select: {
              id: true,
              name: true,
            },
          },
          _count: {
            select: { pets: true },
          },
        },
        orderBy: { createdAt: 'desc' },
        skip: (query.page - 1) * query.limit,
        take: query.limit,
      }),
      prisma.tutor.count({ where }),
    ]);

    return {
      items: items.map((tutor) => ({
        id: tutor.id,
        name: tutor.name,
        phone: tutor.phone,
        whatsapp: tutor.whatsapp,
        email: tutor.email,
        createdAt: tutor.createdAt,
        clinicId: tutor.clinic.id,
        clinicName: tutor.clinic.name,
        petsCount: tutor._count.pets,
      })),
      total,
      page: query.page,
      limit: query.limit,
    };
  }

  async findVeterinarians(query: ListPlatformVeterinariansQuery) {
    const where = {
      ...veterinarianWhere,
      ...(query.q
        ? {
            OR: [
              { name: { contains: query.q, mode: 'insensitive' as const } },
              { email: { contains: query.q, mode: 'insensitive' as const } },
              { crmv: { contains: query.q, mode: 'insensitive' as const } },
              {
                clinic: {
                  name: { contains: query.q, mode: 'insensitive' as const },
                },
              },
            ],
          }
        : {}),
    };

    const [items, total] = await Promise.all([
      prisma.user.findMany({
        where,
        select: {
          id: true,
          name: true,
          email: true,
          crmv: true,
          role: true,
          isActive: true,
          lastLoginAt: true,
          clinic: {
            select: {
              id: true,
              name: true,
              plan: true,
              paymentMethod: true,
              paymentStatus: true,
            },
          },
          _count: {
            select: {
              consultations: true,
              communityCases: true,
              communityCaseComments: true,
              communityCaseLikes: true,
            },
          },
        },
        orderBy: [{ name: 'asc' }],
        skip: (query.page - 1) * query.limit,
        take: query.limit,
      }),
      prisma.user.count({ where }),
    ]);

    const userIds = items.map((item) => item.id);
    const likesReceivedMap = new Map<string, number>();

    if (userIds.length > 0) {
      const likesOnCases = await prisma.communityCaseLike.findMany({
        where: {
          case: {
            authorId: { in: userIds },
          },
        },
        select: {
          case: {
            select: {
              authorId: true,
            },
          },
        },
      });

      for (const like of likesOnCases) {
        const authorId = like.case.authorId;
        likesReceivedMap.set(authorId, (likesReceivedMap.get(authorId) ?? 0) + 1);
      }
    }

    return {
      items: items.map((user) => ({
        id: user.id,
        name: user.name,
        email: user.email,
        crmv: user.crmv,
        role: user.role,
        isActive: user.isActive,
        lastLoginAt: user.lastLoginAt,
        clinicId: user.clinic?.id ?? null,
        clinicName: user.clinic?.name ?? null,
        clinicPlan: user.clinic?.plan ?? null,
        paymentMethod: user.clinic?.paymentMethod ?? null,
        paymentStatus: user.clinic?.paymentStatus ?? null,
        consultationsCount: user._count.consultations,
        communityCasesCount: user._count.communityCases,
        commentsCount: user._count.communityCaseComments,
        likesGivenCount: user._count.communityCaseLikes,
        likesReceivedCount: likesReceivedMap.get(user.id) ?? 0,
      })),
      total,
      page: query.page,
      limit: query.limit,
    };
  }

  async getVeterinarianRelations() {
    const users = await prisma.user.findMany({
      where: veterinarianWhere,
      select: {
        id: true,
        name: true,
        crmv: true,
        clinic: {
          select: {
            name: true,
          },
        },
        _count: {
          select: {
            communityCases: true,
            communityCaseComments: true,
            communityCaseLikes: true,
          },
        },
      },
    });

    const userMap = new Map(
      users.map((user) => [
        user.id,
        {
          id: user.id,
          name: user.name,
          crmv: user.crmv,
          clinicName: user.clinic?.name ?? null,
        },
      ]),
    );

    const ranking = users
      .map((user) => {
        const casesCount = user._count.communityCases;
        const commentsCount = user._count.communityCaseComments;
        const likesGivenCount = user._count.communityCaseLikes;
        const activityScore = casesCount + commentsCount + likesGivenCount;

        return {
          id: user.id,
          name: user.name,
          crmv: user.crmv,
          clinicName: user.clinic?.name ?? null,
          activityScore,
          casesCount,
          commentsCount,
          likesGivenCount,
        };
      })
      .filter((item) => item.activityScore > 0)
      .sort((a, b) => b.activityScore - a.activityScore)
      .slice(0, 10);

    const [comments, likes] = await Promise.all([
      prisma.communityCaseComment.findMany({
        where: {
          author: veterinarianWhere,
          case: {
            author: veterinarianWhere,
          },
        },
        select: {
          authorId: true,
          case: {
            select: {
              authorId: true,
            },
          },
        },
      }),
      prisma.communityCaseLike.findMany({
        where: {
          user: veterinarianWhere,
          case: {
            author: veterinarianWhere,
          },
        },
        select: {
          userId: true,
          case: {
            select: {
              authorId: true,
            },
          },
        },
      }),
    ]);

    type PairAccumulator = {
      userAId: string;
      userBId: string;
      interactionsCount: number;
    };

    const pairMap = new Map<string, PairAccumulator>();

    function addInteraction(actorId: string, targetId: string) {
      if (actorId === targetId) return;

      const [userAId, userBId] =
        actorId < targetId ? [actorId, targetId] : [targetId, actorId];
      const key = `${userAId}:${userBId}`;
      const current = pairMap.get(key);

      if (current) {
        current.interactionsCount += 1;
        return;
      }

      pairMap.set(key, {
        userAId,
        userBId,
        interactionsCount: 1,
      });
    }

    for (const comment of comments) {
      addInteraction(comment.authorId, comment.case.authorId);
    }

    for (const like of likes) {
      addInteraction(like.userId, like.case.authorId);
    }

    const interactionPairs = [...pairMap.values()]
      .sort((a, b) => b.interactionsCount - a.interactionsCount)
      .slice(0, 10)
      .map((pair) => {
        const userA = userMap.get(pair.userAId);
        const userB = userMap.get(pair.userBId);

        return {
          userA: userA ?? {
            id: pair.userAId,
            name: 'Veterinário',
            crmv: null,
            clinicName: null,
          },
          userB: userB ?? {
            id: pair.userBId,
            name: 'Veterinário',
            crmv: null,
            clinicName: null,
          },
          interactionsCount: pair.interactionsCount,
        };
      });

    return {
      ranking,
      interactionPairs,
    };
  }
}
