import { ConsultationStatus } from '../generated/prisma/client.js';
import { CommunityPrismaRepository } from '../repositories/prisma/community-prisma-repository.js';
import type {
  CreateCommunityCaseInput,
  CreateCommunityCommentInput,
  ListCommunityCasesQuery,
  UpdateCommunityCaseInput,
} from '../https/schemas/community-schema.js';
import { HttpError } from './erros/http-error.js';

const communityRepository = new CommunityPrismaRepository();

const SHAREABLE_STATUSES = new Set<ConsultationStatus>([
  ConsultationStatus.FINISHED,
  ConsultationStatus.RETURN_SCHEDULED,
]);

function decimalToNumber(value: { toString(): string } | number | null | undefined) {
  if (value == null) return null;
  if (typeof value === 'number') return value;
  const parsed = Number(value.toString());
  return Number.isFinite(parsed) ? parsed : null;
}

function formatApproximateAge(birthDate: Date | null | undefined): string | null {
  if (!birthDate) return null;

  const now = new Date();
  let years = now.getFullYear() - birthDate.getFullYear();
  let months = now.getMonth() - birthDate.getMonth();

  if (now.getDate() < birthDate.getDate()) {
    months -= 1;
  }
  if (months < 0) {
    years -= 1;
    months += 12;
  }
  if (years < 0) return null;

  if (years === 0) {
    if (months <= 0) return '~1 mês';
    return months === 1 ? '~1 mês' : `~${months} meses`;
  }

  const roundedYears = months >= 6 ? years + 1 : years;
  return roundedYears === 1 ? '~1 ano' : `~${roundedYears} anos`;
}

function normalizeOptionalText(value: string | null | undefined) {
  if (value == null) return null;
  const trimmed = value.trim();
  return trimmed.length > 0 ? trimmed : null;
}

export class CommunityService {
  async list(viewerId: string, query: ListCommunityCasesQuery) {
    return communityRepository.findMany(query.page, query.limit, viewerId, {
      ...(query.q ? { q: query.q } : {}),
      ...(query.species ? { species: query.species } : {}),
      ...(query.sex ? { sex: query.sex } : {}),
    });
  }

  async getById(viewerId: string, id: string) {
    const communityCase = await communityRepository.findById(id, viewerId);
    if (!communityCase) {
      throw new HttpError('Caso não encontrado', 404);
    }
    return communityCase;
  }

  async create(
    authorId: string,
    clinicId: string | null | undefined,
    input: CreateCommunityCaseInput,
  ) {
    if (!clinicId) {
      throw new HttpError('Usuário sem clínica vinculada', 403);
    }

    const existing = await communityRepository.findBySourceConsultationId(input.consultationId);
    if (existing) {
      throw new HttpError('Esta consulta já foi compartilhada na comunidade', 409);
    }

    const consultation = await communityRepository.findConsultationForShare(
      clinicId,
      input.consultationId,
    );

    if (!consultation) {
      throw new HttpError('Consulta não encontrada', 404);
    }

    if (!SHAREABLE_STATUSES.has(consultation.status)) {
      throw new HttpError('Só é possível compartilhar consultas finalizadas', 400);
    }

    const created = await communityRepository.create({
      authorId,
      clinicId,
      sourceConsultationId: consultation.id,
      title: input.title.trim(),
      species: consultation.pet.species,
      sex: consultation.pet.sex,
      approximateAge: formatApproximateAge(consultation.pet.birthDate),
      weightKg: decimalToNumber(consultation.weightKg),
      temperature: decimalToNumber(consultation.temperature),
      mainComplaint: consultation.mainComplaint,
      history: consultation.history,
      physicalExam: consultation.physicalExam,
      diagnosis: consultation.diagnosis,
      conduct: consultation.conduct,
      observations: consultation.observations,
      authorNote: normalizeOptionalText(input.authorNote),
    });

    return { ...created, likedByMe: false };
  }

  async update(
    authorId: string,
    id: string,
    input: UpdateCommunityCaseInput,
  ) {
    const existing = await this.getById(authorId, id);
    if (existing.authorId !== authorId) {
      throw new HttpError('Você só pode editar seus próprios casos', 403);
    }

    const updated = await communityRepository.updateByAuthor(id, authorId, {
      title: input.title.trim(),
      authorNote: normalizeOptionalText(input.authorNote),
    });

    if (!updated) {
      throw new HttpError('Você só pode editar seus próprios casos', 403);
    }

    return this.getById(authorId, id);
  }

  async delete(authorId: string, id: string) {
    await this.getById(authorId, id);
    const deleted = await communityRepository.deleteByAuthor(id, authorId);
    if (deleted === 0) {
      throw new HttpError('Você só pode excluir seus próprios casos', 403);
    }
  }

  async like(userId: string, caseId: string) {
    await this.getById(userId, caseId);
    const existing = await communityRepository.findLike(caseId, userId);
    if (existing) {
      const communityCase = await communityRepository.findById(caseId, userId);
      return communityCase!;
    }

    const updated = await communityRepository.addLike(caseId, userId);
    return { ...updated, likedByMe: true };
  }

  async unlike(userId: string, caseId: string) {
    await this.getById(userId, caseId);
    const updated = await communityRepository.removeLike(caseId, userId);
    if (!updated) {
      throw new HttpError('Caso não encontrado', 404);
    }
    return { ...updated, likedByMe: false };
  }

  async listComments(viewerId: string, caseId: string) {
    await this.getById(viewerId, caseId);
    return communityRepository.listComments(caseId);
  }

  async createComment(
    authorId: string,
    caseId: string,
    input: CreateCommunityCommentInput,
  ) {
    await this.getById(authorId, caseId);
    return communityRepository.createComment(caseId, authorId, input.content.trim());
  }

  async deleteComment(authorId: string, caseId: string, commentId: string) {
    await this.getById(authorId, caseId);
    const deleted = await communityRepository.deleteComment(commentId, authorId);
    if (!deleted) {
      throw new HttpError('Comentário não encontrado ou sem permissão', 404);
    }
  }
}
