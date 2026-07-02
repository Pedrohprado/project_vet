import { ConsultationStatus } from '../generated/prisma/client.js';
import { prisma } from '../lib/prisma.js';
import { pickDefined } from '../lib/pick-defined.js';
import { ConsultationPrismaRepository } from '../repositories/prisma/consultation-prisma-repository.js';
import { AppointmentService } from './appointment-service.js';
import { NotificationService } from './notification-service.js';
import { PetService } from './pet-service.js';
import { HttpError } from './erros/http-error.js';
import type {
  CreateConsultationInput,
  CreatePrescriptionInput,
  FinishConsultationInput,
  ListConsultationsQuery,
  UpdateConsultationInput,
} from '../https/schemas/consultation-schema.js';

const consultationRepository = new ConsultationPrismaRepository();
const petService = new PetService();
const appointmentService = new AppointmentService();
const notificationService = new NotificationService();

export class ConsultationService {
  async list(tenantId: string, query: ListConsultationsQuery) {
    const range =
      query.start && query.end
        ? (() => {
            if (query.start > query.end) {
              throw new HttpError(
                'Data inicial deve ser anterior à data final',
                400,
              );
            }
            return { start: query.start, end: query.end };
          })()
        : undefined;

    return consultationRepository.findMany(
      tenantId,
      query.page,
      query.limit,
      range,
    );
  }

  async getById(tenantId: string, id: string) {
    const consultation = await consultationRepository.findById(tenantId, id);

    if (!consultation) {
      throw new HttpError('Consulta não encontrada', 404);
    }

    return consultation;
  }

  async getOpenByPet(tenantId: string, petId: string) {
    await petService.getById(tenantId, petId);
    return consultationRepository.findOpenByPet(tenantId, petId);
  }

  async delete(tenantId: string, id: string) {
    const consultation = await this.getById(tenantId, id);

    if (consultation.status !== ConsultationStatus.OPEN) {
      throw new HttpError('Apenas consultas em andamento podem ser canceladas', 400);
    }

    await consultationRepository.delete(
      tenantId,
      id,
      consultation.appointmentId,
      consultation.petId,
    );
  }

  async create(
    tenantId: string,
    userId: string,
    input: CreateConsultationInput,
  ) {
    await petService.validateOwnership(tenantId, input.petId, input.tutorId);

    const openConsultation = await consultationRepository.findOpenByPet(
      tenantId,
      input.petId,
    );

    if (openConsultation) {
      throw new HttpError('Já existe uma consulta em andamento para este pet', 409);
    }

    if (input.appointmentId) {
      const appointment = await appointmentService.getById(tenantId, input.appointmentId);

      if (appointment.tutorId !== input.tutorId || appointment.petId !== input.petId) {
        throw new HttpError('Agendamento não corresponde ao tutor/pet informados', 400);
      }

      await appointmentService.confirm(tenantId, input.appointmentId);
    }

    return consultationRepository.create(tenantId, {
      tutorId: input.tutorId,
      petId: input.petId,
      veterinarianId: userId,
      ...pickDefined({ appointmentId: input.appointmentId }),
    });
  }

  async update(tenantId: string, id: string, input: UpdateConsultationInput) {
    const consultation = await this.getById(tenantId, id);

    if (consultation.status !== ConsultationStatus.OPEN) {
      throw new HttpError('Consulta não está aberta para edição', 400);
    }

    return consultationRepository.update(tenantId, id, pickDefined({
      mainComplaint: input.mainComplaint,
      history: input.history,
      physicalExam: input.physicalExam,
      temperature: input.temperature,
      diagnosis: input.diagnosis,
      conduct: input.conduct,
      observations: input.observations,
      needsReturn: input.needsReturn,
      returnDate: input.returnDate,
      prescriptionDocumentType: input.prescriptionDocumentType,
    }));
  }

  async addPrescription(
    tenantId: string,
    id: string,
    input: CreatePrescriptionInput,
  ) {
    const consultation = await this.getById(tenantId, id);

    if (consultation.status !== ConsultationStatus.OPEN) {
      throw new HttpError('Consulta não está aberta para edição', 400);
    }

    return consultationRepository.addPrescription(id, {
      medicineName: input.medicineName,
      ...pickDefined({
        dosage: input.dosage,
        frequency: input.frequency,
        duration: input.duration,
        instructions: input.instructions,
        routeOfAdministration: input.routeOfAdministration,
        pharmacyType: input.pharmacyType,
        quantity: input.quantity,
      }),
    });
  }

  async removePrescription(
    tenantId: string,
    consultationId: string,
    prescriptionId: string,
  ) {
    const consultation = await this.getById(tenantId, consultationId);

    if (consultation.status !== ConsultationStatus.OPEN) {
      throw new HttpError('Consulta não está aberta para edição', 400);
    }

    const result = await consultationRepository.removePrescription(
      consultationId,
      prescriptionId,
    );

    if (result.count === 0) {
      throw new HttpError('Item de receita não encontrado', 404);
    }
  }

  async finish(
    tenantId: string,
    userId: string,
    id: string,
    input: FinishConsultationInput,
  ) {
    const consultation = await this.getById(tenantId, id);

    if (consultation.status !== ConsultationStatus.OPEN) {
      throw new HttpError('Consulta já foi finalizada', 400);
    }

    const needsReturn = input.needsReturn ?? consultation.needsReturn;
    const returnDate = input.returnDate ?? consultation.returnDate ?? undefined;

    const result = await prisma.$transaction(async () => {
      const updated = await consultationRepository.update(tenantId, id, {
        ...pickDefined({
          diagnosis: input.diagnosis ?? consultation.diagnosis ?? undefined,
          conduct: input.conduct ?? consultation.conduct ?? undefined,
          returnDate,
        }),
        needsReturn,
        status: ConsultationStatus.FINISHED,
        finishedAt: new Date(),
      });

      if (needsReturn && returnDate) {
        await appointmentService.createReturn(tenantId, userId, {
          tutorId: consultation.tutorId,
          petId: consultation.petId,
          scheduledAt: returnDate,
          description: 'Retorno agendado na finalização da consulta',
        });
      }

      await notificationService.createPostConsultation({
        clinicId: tenantId,
        tutorId: consultation.tutorId,
        petId: consultation.petId,
        consultationId: id,
        tutorName: consultation.tutor.name,
        recipientPhone: consultation.tutor.whatsapp ?? consultation.tutor.phone,
        petName: consultation.pet.name,
        diagnosis: updated.diagnosis,
        conduct: updated.conduct,
        returnDate: needsReturn && returnDate ? returnDate : null,
      });

      return updated;
    });

    return result;
  }

  async getPrescriptionPdf(tenantId: string, id: string) {
    const data = await consultationRepository.findPrescriptionPdfData(tenantId, id);

    if (!data) {
      throw new HttpError('Consulta não encontrada', 404);
    }

    if (data.status !== ConsultationStatus.FINISHED) {
      throw new HttpError('Receita disponível apenas após finalizar a consulta', 400);
    }

    if (data.prescriptions.length === 0) {
      throw new HttpError('Consulta não possui medicamentos prescritos', 400);
    }

    const { PrescriptionPdfService } = await import('./prescription-pdf-service.js');
    const pdfService = new PrescriptionPdfService();
    const buffer = await pdfService.generate(data);

    return {
      buffer,
      filename: `receita-${data.pet.name.replace(/\s+/g, '-').toLowerCase()}.pdf`,
    };
  }
}
