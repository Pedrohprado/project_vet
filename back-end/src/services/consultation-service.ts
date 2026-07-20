import { AppointmentType, ConsultationStatus } from '../generated/prisma/client.js';
import { prisma } from '../lib/prisma.js';
import { pickDefined } from '../lib/pick-defined.js';
import { ConsultationPrismaRepository } from '../repositories/prisma/consultation-prisma-repository.js';
import { ConsultationAttachmentPrismaRepository } from '../repositories/prisma/consultation-attachment-prisma-repository.js';
import {
  deleteConsultationAttachmentDirectory,
  deleteConsultationAttachmentFile,
  saveConsultationAttachment,
} from '../lib/save-consultation-attachment.js';
import { AppointmentService } from './appointment-service.js';
import { NotificationService } from './notification-service.js';
import { PetService } from './pet-service.js';
import { HttpError } from './erros/http-error.js';
import type {
  CreateConsultationInput,
  CreatePrescriptionInput,
  CreateReturnConsultationInput,
  FinishConsultationInput,
  ListConsultationsQuery,
  UpdateConsultationInput,
} from '../https/schemas/consultation-schema.js';

const consultationRepository = new ConsultationPrismaRepository();
const attachmentRepository = new ConsultationAttachmentPrismaRepository();
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

  async getReturnScheduledByPet(tenantId: string, petId: string) {
    await petService.getById(tenantId, petId);
    return consultationRepository.findReturnScheduledByPet(tenantId, petId);
  }

  async getOpenReturnByParentId(tenantId: string, parentId: string) {
    return consultationRepository.findOpenReturnByParentId(tenantId, parentId);
  }

  async delete(tenantId: string, id: string) {
    const consultation = await this.getById(tenantId, id);

    if (consultation.status !== ConsultationStatus.OPEN) {
      throw new HttpError('Apenas consultas em andamento podem ser canceladas', 400);
    }

    await deleteConsultationAttachmentDirectory(id);

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

    const blocking = await consultationRepository.findBlockingConsultationForNewInitial(
      tenantId,
      input.petId,
    );

    if (blocking) {
      if (blocking.status === ConsultationStatus.RETURN_SCHEDULED) {
        throw new HttpError(
          'Este pet possui retorno agendado pendente. Conclua o retorno antes de iniciar nova consulta.',
          409,
        );
      }

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

  async createReturn(
    tenantId: string,
    userId: string,
    parentId: string,
    input: CreateReturnConsultationInput,
  ) {
    const parent = await this.getById(tenantId, parentId);

    if (parent.status !== ConsultationStatus.RETURN_SCHEDULED) {
      throw new HttpError('Consulta não está aguardando retorno', 400);
    }

    if (parent.parentConsultationId) {
      throw new HttpError('Retorno só pode ser iniciado a partir da consulta original', 400);
    }

    const existingReturn = await consultationRepository.findOpenReturnByParentId(
      tenantId,
      parentId,
    );

    if (existingReturn) {
      return this.getById(tenantId, existingReturn.id);
    }

    const returnAppointment = input.appointmentId
      ? await appointmentService.getById(tenantId, input.appointmentId)
      : await appointmentService.findPendingReturnByConsultation(tenantId, parentId);

    if (!returnAppointment) {
      throw new HttpError('Agendamento de retorno não encontrado', 404);
    }

    if (returnAppointment.type !== AppointmentType.RETURN) {
      throw new HttpError('Agendamento informado não é um retorno', 400);
    }

    if (returnAppointment.sourceConsultationId !== parentId) {
      throw new HttpError('Retorno não pertence a esta consulta', 400);
    }

    const child = await consultationRepository.create(tenantId, {
      tutorId: parent.tutorId,
      petId: parent.petId,
      veterinarianId: userId,
      appointmentId: returnAppointment.id,
      parentConsultationId: parentId,
    });

    await appointmentService.confirm(tenantId, returnAppointment.id);

    return this.getById(tenantId, child.id);
  }

  async cancelScheduledReturn(tenantId: string, parentId: string) {
    const parent = await this.getById(tenantId, parentId);

    if (parent.status !== ConsultationStatus.RETURN_SCHEDULED) {
      throw new HttpError('Consulta não possui retorno agendado', 400);
    }

    if (parent.parentConsultationId) {
      throw new HttpError(
        'Cancelamento de agendamento só se aplica à consulta original',
        400,
      );
    }

    const openReturn = await consultationRepository.findOpenReturnByParentId(
      tenantId,
      parentId,
    );

    if (openReturn) {
      throw new HttpError(
        'Existe um retorno em andamento. Cancele-o antes de cancelar o agendamento.',
        409,
      );
    }

    await prisma.$transaction(async () => {
      await appointmentService.cancelPendingReturnsForConsultation(
        tenantId,
        parentId,
      );

      await consultationRepository.update(tenantId, parentId, {
        status: ConsultationStatus.FINISHED,
        needsReturn: false,
        returnDate: null,
      });
    });

    return this.getById(tenantId, parentId);
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

    if (needsReturn && !returnDate) {
      throw new HttpError('Data do retorno é obrigatória quando retorno está marcado', 400);
    }

    const schedulingReturn = Boolean(needsReturn && returnDate);
    const returnDurationMinutes =
      input.returnDurationMinutes ?? 30;
    const isReturnVisit = Boolean(consultation.parentConsultationId);
    const parentConsultationId = consultation.parentConsultationId ?? undefined;

    const result = await prisma.$transaction(async () => {
      const updated = await consultationRepository.update(tenantId, id, {
        ...pickDefined({
          diagnosis: input.diagnosis ?? consultation.diagnosis ?? undefined,
          conduct: input.conduct ?? consultation.conduct ?? undefined,
          returnDate: schedulingReturn ? returnDate : undefined,
        }),
        ...(schedulingReturn
          ? {
              needsReturn: true,
              status: ConsultationStatus.RETURN_SCHEDULED,
              finishedAt: new Date(),
            }
          : {
              needsReturn: false,
              returnDate: null,
              status: ConsultationStatus.FINISHED,
              finishedAt: new Date(),
            }),
      });

      if (consultation.appointmentId) {
        await appointmentService.complete(tenantId, consultation.appointmentId);
      }

      if (schedulingReturn && returnDate) {
        await appointmentService.upsertReturn(tenantId, userId, {
          sourceConsultationId: id,
          tutorId: consultation.tutorId,
          petId: consultation.petId,
          scheduledAt: returnDate,
          durationMinutes: returnDurationMinutes,
          description: isReturnVisit
            ? 'Retorno agendado na finalização do retorno'
            : 'Retorno agendado na finalização da consulta',
        });

        if (isReturnVisit && parentConsultationId) {
          await consultationRepository.update(tenantId, parentConsultationId, {
            status: ConsultationStatus.FINISHED,
            finishedAt: new Date(),
          });
        }
      } else {
        await appointmentService.completePendingReturnsForConsultation(tenantId, id);

        if (isReturnVisit && parentConsultationId) {
          await consultationRepository.update(tenantId, parentConsultationId, {
            status: ConsultationStatus.FINISHED,
            finishedAt: new Date(),
          });
        }
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
        returnDate: schedulingReturn && returnDate ? returnDate : null,
      });

      return updated;
    });

    return result;
  }

  private assertCanManageAttachments(status: ConsultationStatus) {
    if (
      status !== ConsultationStatus.OPEN &&
      status !== ConsultationStatus.FINISHED &&
      status !== ConsultationStatus.RETURN_SCHEDULED
    ) {
      throw new HttpError(
        'Anexos só podem ser gerenciados em consultas em andamento ou finalizadas',
        400,
      );
    }
  }

  private assertCanUploadAttachments(status: ConsultationStatus) {
    if (status !== ConsultationStatus.OPEN) {
      throw new HttpError(
        'Anexos só podem ser enviados em consultas em andamento',
        400,
      );
    }
  }

  async listAttachments(tenantId: string, consultationId: string) {
    await this.getById(tenantId, consultationId);
    return attachmentRepository.findManyByConsultation(tenantId, consultationId);
  }

  async addAttachment(
    tenantId: string,
    userId: string,
    consultationId: string,
    input: {
      buffer: Buffer;
      fileName: string;
      mimeType?: string;
      label?: string;
    },
  ) {
    const consultation = await this.getById(tenantId, consultationId);
    this.assertCanUploadAttachments(consultation.status);

    const { fileUrl } = await saveConsultationAttachment(
      consultationId,
      input.buffer,
      input.mimeType,
    );

    return attachmentRepository.create({
      clinicId: tenantId,
      consultationId,
      fileName: input.fileName.trim() || 'exame.pdf',
      fileUrl,
      mimeType: 'application/pdf',
      uploadedById: userId,
      ...pickDefined({ label: input.label?.trim() }),
    });
  }

  async removeAttachment(
    tenantId: string,
    consultationId: string,
    attachmentId: string,
  ) {
    const consultation = await this.getById(tenantId, consultationId);
    this.assertCanUploadAttachments(consultation.status);

    const attachment = await attachmentRepository.findById(tenantId, attachmentId);

    if (!attachment || attachment.consultationId !== consultationId) {
      throw new HttpError('Anexo não encontrado', 404);
    }

    await deleteConsultationAttachmentFile(attachment.fileUrl);

    const result = await attachmentRepository.delete(tenantId, attachmentId);

    if (result.count === 0) {
      throw new HttpError('Anexo não encontrado', 404);
    }
  }

  async getPrescriptionPdf(tenantId: string, id: string) {
    const data = await consultationRepository.findPrescriptionPdfData(tenantId, id);

    if (!data) {
      throw new HttpError('Consulta não encontrada', 404);
    }

    if (
      data.status !== ConsultationStatus.FINISHED &&
      data.status !== ConsultationStatus.RETURN_SCHEDULED
    ) {
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
