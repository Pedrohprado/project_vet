import { UserRole } from '../generated/prisma/client.js';
import type {
  CreateProductIdeaInput,
  MoveProductIdeaInput,
} from '../https/schemas/product-idea-schema.js';
import { ProductIdeaPrismaRepository } from '../repositories/prisma/product-idea-prisma-repository.js';
import { HttpError } from './erros/http-error.js';

const productIdeaRepository = new ProductIdeaPrismaRepository();

function normalizeOptionalText(value: string | null | undefined) {
  if (value == null) return null;
  const trimmed = value.trim();
  return trimmed.length > 0 ? trimmed : null;
}

export class ProductIdeaService {
  async list() {
    return productIdeaRepository.findAll();
  }

  async create(authorId: string, input: CreateProductIdeaInput) {
    return productIdeaRepository.create({
      authorId,
      title: input.title.trim(),
      description: normalizeOptionalText(input.description),
    });
  }

  async move(role: UserRole, id: string, input: MoveProductIdeaInput) {
    if (role !== UserRole.SUPER_ADMIN) {
      throw new HttpError('Apenas administradores da plataforma podem mover ideias', 403);
    }

    const idea = await productIdeaRepository.move(id, input.status, input.index);
    if (!idea) {
      throw new HttpError('Ideia não encontrada', 404);
    }

    return idea;
  }
}
