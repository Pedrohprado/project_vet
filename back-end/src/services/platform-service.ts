import { PlatformPrismaRepository } from '../repositories/prisma/platform-prisma-repository.js';
import { pickDefined } from '../lib/pick-defined.js';
import { HttpError } from './erros/http-error.js';
import type {
  ListPlatformClinicsQuery,
  ListPlatformTutorsQuery,
  ListPlatformVeterinariansQuery,
  UpdateClinicStatusInput,
} from '../https/schemas/platform-schema.js';

const platformRepository = new PlatformPrismaRepository();

export class PlatformService {
  async getStats() {
    return platformRepository.getStats();
  }

  async listClinics(query: ListPlatformClinicsQuery) {
    return platformRepository.findClinics(query);
  }

  async updateClinicStatus(id: string, isActive: boolean) {
    try {
      return await platformRepository.updateClinicStatus(id, isActive);
    } catch {
      throw new HttpError('Clínica não encontrada', 404);
    }
  }

  async updateClinic(id: string, data: UpdateClinicStatusInput) {
    try {
      return await platformRepository.updateClinic(id, pickDefined(data));
    } catch {
      throw new HttpError('Clínica não encontrada', 404);
    }
  }

  async listTutors(query: ListPlatformTutorsQuery) {
    return platformRepository.findTutors(query);
  }

  async listVeterinarians(query: ListPlatformVeterinariansQuery) {
    return platformRepository.findVeterinarians(query);
  }

  async getVeterinarianRelations() {
    return platformRepository.getVeterinarianRelations();
  }
}
