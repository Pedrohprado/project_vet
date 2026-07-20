import { prisma } from '../../lib/prisma.js';
import type { PetSex, PetSpecies } from '../../generated/prisma/client.js';

const authorSelect = {
  id: true,
  name: true,
  crmv: true,
} as const;

const clinicSelect = {
  id: true,
  name: true,
} as const;

const communityCaseSelect = {
  id: true,
  authorId: true,
  clinicId: true,
  sourceConsultationId: true,
  title: true,
  species: true,
  sex: true,
  approximateAge: true,
  weightKg: true,
  temperature: true,
  mainComplaint: true,
  history: true,
  physicalExam: true,
  diagnosis: true,
  conduct: true,
  observations: true,
  authorNote: true,
  likesCount: true,
  commentsCount: true,
  createdAt: true,
  updatedAt: true,
  author: { select: authorSelect },
  clinic: { select: clinicSelect },
} as const;

const commentSelect = {
  id: true,
  caseId: true,
  authorId: true,
  content: true,
  createdAt: true,
  updatedAt: true,
  author: { select: authorSelect },
} as const;

export type CreateCommunityCaseData = {
  authorId: string;
  clinicId: string;
  sourceConsultationId: string;
  title: string;
  species: PetSpecies;
  sex: PetSex;
  approximateAge?: string | null;
  weightKg?: number | null;
  temperature?: number | null;
  mainComplaint?: string | null;
  history?: string | null;
  physicalExam?: string | null;
  diagnosis?: string | null;
  conduct?: string | null;
  observations?: string | null;
  authorNote?: string | null;
};

export class CommunityPrismaRepository {
  async findMany(
    page: number,
    limit: number,
    viewerId: string,
    filters: {
      q?: string;
      species?: PetSpecies;
      sex?: PetSex;
    } = {},
  ) {
    const query = filters.q?.trim();
    const where = {
      ...(filters.species ? { species: filters.species } : {}),
      ...(filters.sex ? { sex: filters.sex } : {}),
      ...(query
        ? {
            OR: [
              { title: { contains: query, mode: 'insensitive' as const } },
              { diagnosis: { contains: query, mode: 'insensitive' as const } },
              { mainComplaint: { contains: query, mode: 'insensitive' as const } },
              { authorNote: { contains: query, mode: 'insensitive' as const } },
              { conduct: { contains: query, mode: 'insensitive' as const } },
              { author: { name: { contains: query, mode: 'insensitive' as const } } },
              { clinic: { name: { contains: query, mode: 'insensitive' as const } } },
            ],
          }
        : {}),
    };

    const [items, total] = await Promise.all([
      prisma.communityCase.findMany({
        where,
        select: {
          ...communityCaseSelect,
          likes: {
            where: { userId: viewerId },
            select: { id: true },
            take: 1,
          },
        },
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * limit,
        take: limit,
      }),
      prisma.communityCase.count({ where }),
    ]);

    return {
      items: items.map(({ likes, ...item }) => ({
        ...item,
        likedByMe: likes.length > 0,
      })),
      total,
      page,
      limit,
    };
  }

  async findById(id: string, viewerId: string) {
    const item = await prisma.communityCase.findUnique({
      where: { id },
      select: {
        ...communityCaseSelect,
        likes: {
          where: { userId: viewerId },
          select: { id: true },
          take: 1,
        },
      },
    });

    if (!item) return null;

    const { likes, ...rest } = item;
    return { ...rest, likedByMe: likes.length > 0 };
  }

  async findBySourceConsultationId(sourceConsultationId: string) {
    return prisma.communityCase.findUnique({
      where: { sourceConsultationId },
      select: { id: true },
    });
  }

  async create(data: CreateCommunityCaseData) {
    return prisma.communityCase.create({
      data: {
        authorId: data.authorId,
        clinicId: data.clinicId,
        sourceConsultationId: data.sourceConsultationId,
        title: data.title,
        species: data.species,
        sex: data.sex,
        approximateAge: data.approximateAge ?? null,
        weightKg: data.weightKg ?? null,
        temperature: data.temperature ?? null,
        mainComplaint: data.mainComplaint ?? null,
        history: data.history ?? null,
        physicalExam: data.physicalExam ?? null,
        diagnosis: data.diagnosis ?? null,
        conduct: data.conduct ?? null,
        observations: data.observations ?? null,
        authorNote: data.authorNote ?? null,
      },
      select: communityCaseSelect,
    });
  }

  async updateByAuthor(
    id: string,
    authorId: string,
    data: { title: string; authorNote: string | null },
  ) {
    const result = await prisma.communityCase.updateMany({
      where: { id, authorId },
      data: {
        title: data.title,
        authorNote: data.authorNote,
      },
    });
    if (result.count === 0) return null;
    return prisma.communityCase.findUnique({
      where: { id },
      select: communityCaseSelect,
    });
  }

  async deleteByAuthor(id: string, authorId: string) {
    const result = await prisma.communityCase.deleteMany({
      where: { id, authorId },
    });
    return result.count;
  }

  async findLike(caseId: string, userId: string) {
    return prisma.communityCaseLike.findUnique({
      where: { caseId_userId: { caseId, userId } },
      select: { id: true },
    });
  }

  async addLike(caseId: string, userId: string) {
    return prisma.$transaction(async (tx) => {
      await tx.communityCaseLike.create({
        data: { caseId, userId },
      });
      return tx.communityCase.update({
        where: { id: caseId },
        data: { likesCount: { increment: 1 } },
        select: communityCaseSelect,
      });
    });
  }

  async removeLike(caseId: string, userId: string) {
    return prisma.$transaction(async (tx) => {
      const deleted = await tx.communityCaseLike.deleteMany({
        where: { caseId, userId },
      });
      if (deleted.count === 0) {
        return tx.communityCase.findUnique({
          where: { id: caseId },
          select: communityCaseSelect,
        });
      }
      return tx.communityCase.update({
        where: { id: caseId },
        data: { likesCount: { decrement: 1 } },
        select: communityCaseSelect,
      });
    });
  }

  async listComments(caseId: string) {
    return prisma.communityCaseComment.findMany({
      where: { caseId },
      select: commentSelect,
      orderBy: { createdAt: 'asc' },
    });
  }

  async createComment(caseId: string, authorId: string, content: string) {
    return prisma.$transaction(async (tx) => {
      const comment = await tx.communityCaseComment.create({
        data: { caseId, authorId, content },
        select: commentSelect,
      });
      await tx.communityCase.update({
        where: { id: caseId },
        data: { commentsCount: { increment: 1 } },
      });
      return comment;
    });
  }

  async deleteComment(commentId: string, authorId: string) {
    return prisma.$transaction(async (tx) => {
      const comment = await tx.communityCaseComment.findFirst({
        where: { id: commentId, authorId },
        select: { id: true, caseId: true },
      });
      if (!comment) return null;

      await tx.communityCaseComment.delete({ where: { id: commentId } });
      await tx.communityCase.update({
        where: { id: comment.caseId },
        data: { commentsCount: { decrement: 1 } },
      });
      return comment;
    });
  }

  async findConsultationForShare(clinicId: string, consultationId: string) {
    return prisma.consultation.findFirst({
      where: { id: consultationId, clinicId },
      select: {
        id: true,
        status: true,
        weightKg: true,
        temperature: true,
        mainComplaint: true,
        history: true,
        physicalExam: true,
        diagnosis: true,
        conduct: true,
        observations: true,
        pet: {
          select: {
            species: true,
            sex: true,
            birthDate: true,
          },
        },
      },
    });
  }
}
