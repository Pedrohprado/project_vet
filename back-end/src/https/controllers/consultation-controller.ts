import type { FastifyReply, FastifyRequest } from 'fastify';
import { ConsultationService } from '../../services/consultation-service.js';
import { HttpError } from '../../services/erros/http-error.js';
import {
  createConsultationSchema,
  createPrescriptionSchema,
  createReturnConsultationSchema,
  finishConsultationSchema,
  listConsultationsQuerySchema,
  postSummarySchema,
  updateConsultationSchema,
} from '../schemas/consultation-schema.js';
import { ConsultationSummaryService } from '../../services/consultation-summary-service.js';

const consultationService = new ConsultationService();
const consultationSummaryService = new ConsultationSummaryService();

export async function listConsultations(request: FastifyRequest, reply: FastifyReply) {
  const parsed = listConsultationsQuerySchema.safeParse(request.query);

  if (!parsed.success) {
    const firstError = parsed.error.issues[0]?.message ?? 'Parâmetros inválidos';
    throw new HttpError(firstError, 400);
  }

  const result = await consultationService.list(request.tenantId, parsed.data);

  return reply.status(200).send(result);
}

export async function getOpenConsultationByPet(
  request: FastifyRequest,
  reply: FastifyReply,
) {
  const { petId } = request.params as { petId: string };
  const consultation = await consultationService.getOpenByPet(
    request.tenantId,
    petId,
  );

  if (!consultation) {
    throw new HttpError('Nenhuma consulta em andamento', 404);
  }

  return reply.status(200).send(consultation);
}

export async function getReturnScheduledConsultationByPet(
  request: FastifyRequest,
  reply: FastifyReply,
) {
  const { petId } = request.params as { petId: string };
  const consultation = await consultationService.getReturnScheduledByPet(
    request.tenantId,
    petId,
  );

  if (!consultation) {
    throw new HttpError('Nenhum retorno agendado', 404);
  }

  return reply.status(200).send(consultation);
}

export async function getConsultation(request: FastifyRequest, reply: FastifyReply) {
  const { id } = request.params as { id: string };
  const consultation = await consultationService.getById(request.tenantId, id);

  return reply.status(200).send(consultation);
}

export async function createConsultation(request: FastifyRequest, reply: FastifyReply) {
  const parsed = createConsultationSchema.safeParse(request.body);

  if (!parsed.success) {
    const firstError = parsed.error.issues[0]?.message ?? 'Dados inválidos';
    throw new HttpError(firstError, 400);
  }

  const consultation = await consultationService.create(
    request.tenantId,
    request.authUser.id,
    parsed.data,
  );

  return reply.status(201).send(consultation);
}

export async function updateConsultation(request: FastifyRequest, reply: FastifyReply) {
  const { id } = request.params as { id: string };
  const parsed = updateConsultationSchema.safeParse(request.body);

  if (!parsed.success) {
    const firstError = parsed.error.issues[0]?.message ?? 'Dados inválidos';
    throw new HttpError(firstError, 400);
  }

  const consultation = await consultationService.update(
    request.tenantId,
    id,
    parsed.data,
  );

  return reply.status(200).send(consultation);
}

export async function addPrescription(request: FastifyRequest, reply: FastifyReply) {
  const { id } = request.params as { id: string };
  const parsed = createPrescriptionSchema.safeParse(request.body);

  if (!parsed.success) {
    const firstError = parsed.error.issues[0]?.message ?? 'Dados inválidos';
    throw new HttpError(firstError, 400);
  }

  const prescription = await consultationService.addPrescription(
    request.tenantId,
    id,
    parsed.data,
  );

  return reply.status(201).send(prescription);
}

export async function removePrescription(request: FastifyRequest, reply: FastifyReply) {
  const { id, prescriptionId } = request.params as {
    id: string;
    prescriptionId: string;
  };

  await consultationService.removePrescription(
    request.tenantId,
    id,
    prescriptionId,
  );

  return reply.status(204).send();
}

export async function createReturnConsultation(
  request: FastifyRequest,
  reply: FastifyReply,
) {
  const { parentId } = request.params as { parentId: string };
  const parsed = createReturnConsultationSchema.safeParse(request.body ?? {});

  if (!parsed.success) {
    const firstError = parsed.error.issues[0]?.message ?? 'Dados inválidos';
    throw new HttpError(firstError, 400);
  }

  const consultation = await consultationService.createReturn(
    request.tenantId,
    request.authUser.id,
    parentId,
    parsed.data,
  );

  return reply.status(201).send(consultation);
}

export async function getOpenReturnConsultationByParent(
  request: FastifyRequest,
  reply: FastifyReply,
) {
  const { parentId } = request.params as { parentId: string };
  const consultation = await consultationService.getOpenReturnByParentId(
    request.tenantId,
    parentId,
  );

  if (!consultation) {
    throw new HttpError('Nenhum retorno em andamento', 404);
  }

  return reply.status(200).send(consultation);
}

export async function cancelScheduledReturn(
  request: FastifyRequest,
  reply: FastifyReply,
) {
  const { parentId } = request.params as { parentId: string };
  const consultation = await consultationService.cancelScheduledReturn(
    request.tenantId,
    parentId,
  );

  return reply.status(200).send(consultation);
}

export async function finishConsultation(request: FastifyRequest, reply: FastifyReply) {
  const { id } = request.params as { id: string };
  const parsed = finishConsultationSchema.safeParse(request.body);

  if (!parsed.success) {
    const firstError = parsed.error.issues[0]?.message ?? 'Dados inválidos';
    throw new HttpError(firstError, 400);
  }

  const consultation = await consultationService.finish(
    request.tenantId,
    request.authUser.id,
    id,
    parsed.data,
  );

  return reply.status(200).send(consultation);
}

export async function generatePostSummary(
  request: FastifyRequest,
  reply: FastifyReply,
) {
  const { id } = request.params as { id: string };
  const parsed = postSummarySchema.safeParse(request.body ?? {});

  if (!parsed.success) {
    const firstError = parsed.error.issues[0]?.message ?? 'Dados inválidos';
    throw new HttpError(firstError, 400);
  }

  const consultation = await consultationService.getById(request.tenantId, id);
  const draft = parsed.data;

  const diagnosis = draft.diagnosis ?? consultation.diagnosis;
  const conduct = draft.conduct ?? consultation.conduct;
  const needsReturn = draft.needsReturn ?? consultation.needsReturn;
  const returnDate =
    needsReturn && (draft.returnDate ?? consultation.returnDate)
      ? (draft.returnDate ?? consultation.returnDate)
      : null;

  const message =
    await consultationSummaryService.generatePostConsultationMessage({
      tutorName: consultation.tutor.name,
      petName: consultation.pet.name,
      petSpecies: consultation.pet.species,
      veterinarianName: consultation.veterinarian.name,
      mainComplaint: consultation.mainComplaint,
      diagnosis,
      conduct,
      needsReturn: Boolean(needsReturn && returnDate),
      returnDate,
      prescriptions: consultation.prescriptions.map((prescription) => ({
        medicineName: prescription.medicineName,
        dosage: prescription.dosage,
        frequency: prescription.frequency,
        duration: prescription.duration,
        instructions: prescription.instructions,
      })),
    });

  return reply.status(200).send({ message });
}

export async function deleteConsultation(request: FastifyRequest, reply: FastifyReply) {
  const { id } = request.params as { id: string };
  await consultationService.delete(request.tenantId, id);

  return reply.status(204).send();
}

export async function listConsultationAttachments(
  request: FastifyRequest,
  reply: FastifyReply,
) {
  const { id } = request.params as { id: string };
  const attachments = await consultationService.listAttachments(
    request.tenantId,
    id,
  );

  return reply.status(200).send(attachments);
}

export async function addConsultationAttachment(
  request: FastifyRequest,
  reply: FastifyReply,
) {
  const { id } = request.params as { id: string };

  let fileBuffer: Buffer | null = null;
  let fileName = 'exame.pdf';
  let mimeType: string | undefined;
  let label: string | undefined;

  const parts = request.parts();

  for await (const part of parts) {
    if (part.type === 'file') {
      fileBuffer = await part.toBuffer();
      fileName = part.filename || fileName;
      mimeType = part.mimetype;
    } else if (part.type === 'field' && part.fieldname === 'label') {
      const value = String(part.value).trim();
      label = value || undefined;
    }
  }

  if (!fileBuffer) {
    throw new HttpError('Arquivo PDF é obrigatório', 400);
  }

  const attachment = await consultationService.addAttachment(
    request.tenantId,
    request.authUser.id,
    id,
    {
      buffer: fileBuffer,
      fileName,
      ...(mimeType ? { mimeType } : {}),
      ...(label ? { label } : {}),
    },
  );

  return reply.status(201).send(attachment);
}

export async function removeConsultationAttachment(
  request: FastifyRequest,
  reply: FastifyReply,
) {
  const { id, attachmentId } = request.params as {
    id: string;
    attachmentId: string;
  };

  await consultationService.removeAttachment(
    request.tenantId,
    id,
    attachmentId,
  );

  return reply.status(204).send();
}

export async function downloadPrescriptionPdf(
  request: FastifyRequest,
  reply: FastifyReply,
) {
  const { id } = request.params as { id: string };
  const { buffer, filename } = await consultationService.getPrescriptionPdf(
    request.tenantId,
    id,
  );

  return reply
    .header('Content-Type', 'application/pdf')
    .header('Content-Disposition', `attachment; filename="${filename}"`)
    .send(buffer);
}
