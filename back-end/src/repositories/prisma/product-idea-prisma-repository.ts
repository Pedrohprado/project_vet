import { prisma } from '../../lib/prisma.js';
import type { ProductIdeaStatus } from '../../generated/prisma/client.js';

const authorSelect = {
  id: true,
  name: true,
} as const;

const productIdeaSelect = {
  id: true,
  title: true,
  description: true,
  status: true,
  position: true,
  authorId: true,
  createdAt: true,
  updatedAt: true,
  author: { select: authorSelect },
} as const;

export class ProductIdeaPrismaRepository {
  async findAll() {
    return prisma.productIdea.findMany({
      select: productIdeaSelect,
      orderBy: [{ status: 'asc' }, { position: 'asc' }, { createdAt: 'asc' }],
    });
  }

  async findById(id: string) {
    return prisma.productIdea.findUnique({
      where: { id },
      select: productIdeaSelect,
    });
  }

  async create(data: { authorId: string; title: string; description: string | null }) {
    const last = await prisma.productIdea.findFirst({
      where: { status: 'IDEA' },
      orderBy: { position: 'desc' },
      select: { position: true },
    });

    return prisma.productIdea.create({
      data: {
        authorId: data.authorId,
        title: data.title,
        description: data.description,
        status: 'IDEA',
        position: (last?.position ?? -1) + 1,
      },
      select: productIdeaSelect,
    });
  }

  async move(id: string, status: ProductIdeaStatus, index: number) {
    return prisma.$transaction(async (tx) => {
      const idea = await tx.productIdea.findUnique({ where: { id } });
      if (!idea) return null;

      const targetIdeas = await tx.productIdea.findMany({
        where: { status, NOT: { id } },
        orderBy: [{ position: 'asc' }, { createdAt: 'asc' }],
        select: { id: true },
      });

      const clampedIndex = Math.max(0, Math.min(index, targetIdeas.length));
      const orderedIds = [
        ...targetIdeas.slice(0, clampedIndex).map((item) => item.id),
        id,
        ...targetIdeas.slice(clampedIndex).map((item) => item.id),
      ];

      await tx.productIdea.update({
        where: { id },
        data: { status },
      });

      await Promise.all(
        orderedIds.map((ideaId, position) =>
          tx.productIdea.update({
            where: { id: ideaId },
            data: { position },
          }),
        ),
      );

      if (idea.status !== status) {
        const sourceIdeas = await tx.productIdea.findMany({
          where: { status: idea.status },
          orderBy: [{ position: 'asc' }, { createdAt: 'asc' }],
          select: { id: true },
        });

        await Promise.all(
          sourceIdeas.map((item, position) =>
            tx.productIdea.update({
              where: { id: item.id },
              data: { position },
            }),
          ),
        );
      }

      return tx.productIdea.findUnique({
        where: { id },
        select: productIdeaSelect,
      });
    });
  }
}
