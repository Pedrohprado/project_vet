import { TutorPrismaRepository } from '../repositories/prisma/tutor-prisma-repository.js';
import { HttpError } from './erros/http-error.js';
import { pickDefined } from '../lib/pick-defined.js';
import type { CreateTutorInput, ListTutorsQuery, UpdateTutorInput } from '../https/schemas/tutor-schema.js';

const tutorRepository = new TutorPrismaRepository();

export class TutorService {
  async list(tenantId: string, query: ListTutorsQuery) {
    return tutorRepository.findMany(tenantId, query.q, query.page, query.limit);
  }

  async getById(tenantId: string, id: string) {
    const tutor = await tutorRepository.findById(tenantId, id);

    if (!tutor) {
      throw new HttpError('Tutor não encontrado', 404);
    }

    return tutor;
  }

  async create(tenantId: string, input: CreateTutorInput) {
    return tutorRepository.create(tenantId, {
      name: input.name,
      ...pickDefined({
        document: input.document,
        phone: input.phone,
        whatsapp: input.whatsapp,
        email: input.email || undefined,
        zipCode: input.zipCode,
        street: input.street,
        number: input.number,
        complement: input.complement,
        neighborhood: input.neighborhood,
        city: input.city,
        state: input.state,
        notes: input.notes,
      }),
    });
  }

  async update(tenantId: string, id: string, input: UpdateTutorInput) {
    await this.getById(tenantId, id);

    return tutorRepository.update(tenantId, id, pickDefined({
      name: input.name,
      document: input.document,
      phone: input.phone,
      whatsapp: input.whatsapp,
      email: input.email === '' ? undefined : input.email,
      zipCode: input.zipCode,
      street: input.street,
      number: input.number,
      complement: input.complement,
      neighborhood: input.neighborhood,
      city: input.city,
      state: input.state,
      notes: input.notes,
    }));
  }

  async delete(tenantId: string, id: string) {
    await this.getById(tenantId, id);
    await tutorRepository.delete(tenantId, id);
  }
}
