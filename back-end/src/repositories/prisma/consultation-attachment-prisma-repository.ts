import { prisma } from '../../lib/prisma.js';

const attachmentSelect = {
  id: true,
  clinicId: true,
  consultationId: true,
  fileName: true,
  fileUrl: true,
  mimeType: true,
  label: true,
  uploadedById: true,
  createdAt: true,
  uploadedBy: { select: { id: true, name: true } },
} as const;

export class ConsultationAttachmentPrismaRepository {
  async findManyByConsultation(clinicId: string, consultationId: string) {
    return prisma.consultationAttachment.findMany({
      where: { clinicId, consultationId },
      select: attachmentSelect,
      orderBy: { createdAt: 'asc' },
    });
  }

  async findById(clinicId: string, id: string) {
    return prisma.consultationAttachment.findFirst({
      where: { id, clinicId },
      select: attachmentSelect,
    });
  }

  async create(data: {
    clinicId: string;
    consultationId: string;
    fileName: string;
    fileUrl: string;
    mimeType: string;
    label?: string;
    uploadedById: string;
  }) {
    return prisma.consultationAttachment.create({
      data,
      select: attachmentSelect,
    });
  }

  async delete(clinicId: string, id: string) {
    return prisma.consultationAttachment.deleteMany({
      where: { id, clinicId },
    });
  }

  async findFileUrlsByConsultation(clinicId: string, consultationId: string) {
    return prisma.consultationAttachment.findMany({
      where: { clinicId, consultationId },
      select: { fileUrl: true },
    });
  }
}
