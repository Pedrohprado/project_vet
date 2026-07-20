import { mkdir, rm, unlink, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { randomUUID } from 'node:crypto';
import { HttpError } from '../services/erros/http-error.js';

export const MAX_CONSULTATION_ATTACHMENT_BYTES = 10 * 1024 * 1024;
const CONSULTATIONS_UPLOAD_DIR = path.resolve('uploads/consultations');
const PDF_MAGIC = Buffer.from('%PDF');

export function getConsultationAttachmentRelativeUrl(
  consultationId: string,
  fileId: string,
) {
  return `/uploads/consultations/${consultationId}/${fileId}.pdf`;
}

export function getConsultationAttachmentFilePath(
  consultationId: string,
  fileId: string,
) {
  return path.join(CONSULTATIONS_UPLOAD_DIR, consultationId, `${fileId}.pdf`);
}

export function resolveConsultationAttachmentPath(fileUrl: string) {
  const match = fileUrl.match(
    /^\/uploads\/consultations\/([a-f0-9-]+)\/([a-f0-9-]+)\.pdf$/i,
  );

  if (!match?.[1] || !match[2]) {
    return null;
  }

  return getConsultationAttachmentFilePath(match[1], match[2]);
}

function validatePdfBuffer(buffer: Buffer) {
  if (buffer.length === 0) {
    throw new HttpError('Arquivo vazio', 400);
  }

  if (buffer.length > MAX_CONSULTATION_ATTACHMENT_BYTES) {
    throw new HttpError('Arquivo excede o tamanho máximo de 10 MB', 400);
  }

  if (!buffer.subarray(0, 4).equals(PDF_MAGIC)) {
    throw new HttpError('Apenas arquivos PDF são permitidos', 400);
  }
}

export async function saveConsultationAttachment(
  consultationId: string,
  buffer: Buffer,
  mimeType: string | undefined,
) {
  if (mimeType && mimeType !== 'application/pdf') {
    throw new HttpError('Apenas arquivos PDF são permitidos', 400);
  }

  validatePdfBuffer(buffer);

  const fileId = randomUUID();
  const dirPath = path.join(CONSULTATIONS_UPLOAD_DIR, consultationId);

  await mkdir(dirPath, { recursive: true });

  const filePath = getConsultationAttachmentFilePath(consultationId, fileId);
  await writeFile(filePath, buffer);

  return {
    fileId,
    fileUrl: getConsultationAttachmentRelativeUrl(consultationId, fileId),
  };
}

export async function deleteConsultationAttachmentFile(fileUrl: string) {
  const filePath = resolveConsultationAttachmentPath(fileUrl);

  if (!filePath) {
    return;
  }

  try {
    await unlink(filePath);
  } catch {
    // ignore if file does not exist
  }
}

export async function deleteConsultationAttachmentDirectory(consultationId: string) {
  const dirPath = path.join(CONSULTATIONS_UPLOAD_DIR, consultationId);

  try {
    await rm(dirPath, { recursive: true, force: true });
  } catch {
    // ignore if directory does not exist
  }
}
