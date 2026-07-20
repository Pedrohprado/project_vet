import { mkdir, unlink, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { randomUUID } from 'node:crypto';
import { HttpError } from '../services/erros/http-error.js';

export const MAX_PET_PHOTO_BYTES = 5 * 1024 * 1024;
const PETS_UPLOAD_DIR = path.resolve('uploads/pets');

const ALLOWED_MIME_TYPES = new Set([
  'image/jpeg',
  'image/png',
  'image/webp',
]);

type ImageFormat = 'jpeg' | 'png' | 'webp';

const EXTENSION_BY_FORMAT: Record<ImageFormat, string> = {
  jpeg: 'jpg',
  png: 'png',
  webp: 'webp',
};

export function getPetPhotoRelativeUrl(
  petId: string,
  fileId: string,
  format: ImageFormat,
) {
  return `/uploads/pets/${petId}/${fileId}.${EXTENSION_BY_FORMAT[format]}`;
}

export function getPetPhotoFilePath(
  petId: string,
  fileId: string,
  format: ImageFormat,
) {
  return path.join(
    PETS_UPLOAD_DIR,
    petId,
    `${fileId}.${EXTENSION_BY_FORMAT[format]}`,
  );
}

export function resolvePetPhotoPath(photoUrl: string | null | undefined) {
  if (!photoUrl) {
    return null;
  }

  const match = photoUrl.match(
    /^\/uploads\/pets\/([a-f0-9-]+)\/([a-f0-9-]+)\.(jpg|jpeg|png|webp)$/i,
  );

  if (!match?.[1] || !match[2] || !match[3]) {
    return null;
  }

  const ext = match[3].toLowerCase();
  const format: ImageFormat =
    ext === 'jpg' || ext === 'jpeg' ? 'jpeg' : ext === 'png' ? 'png' : 'webp';

  return getPetPhotoFilePath(match[1], match[2], format);
}

function detectImageFormat(buffer: Buffer): ImageFormat | null {
  if (
    buffer.length >= 3 &&
    buffer[0] === 0xff &&
    buffer[1] === 0xd8 &&
    buffer[2] === 0xff
  ) {
    return 'jpeg';
  }

  if (
    buffer.length >= 8 &&
    buffer[0] === 0x89 &&
    buffer[1] === 0x50 &&
    buffer[2] === 0x4e &&
    buffer[3] === 0x47 &&
    buffer[4] === 0x0d &&
    buffer[5] === 0x0a &&
    buffer[6] === 0x1a &&
    buffer[7] === 0x0a
  ) {
    return 'png';
  }

  if (
    buffer.length >= 12 &&
    buffer.subarray(0, 4).toString('ascii') === 'RIFF' &&
    buffer.subarray(8, 12).toString('ascii') === 'WEBP'
  ) {
    return 'webp';
  }

  return null;
}

function validateImageBuffer(buffer: Buffer, mimeType: string | undefined) {
  if (buffer.length === 0) {
    throw new HttpError('Arquivo vazio', 400);
  }

  if (buffer.length > MAX_PET_PHOTO_BYTES) {
    throw new HttpError('Arquivo excede o tamanho máximo de 5 MB', 400);
  }

  if (mimeType && !ALLOWED_MIME_TYPES.has(mimeType)) {
    throw new HttpError('Apenas imagens JPEG, PNG ou WebP são permitidas', 400);
  }

  const format = detectImageFormat(buffer);

  if (!format) {
    throw new HttpError('Apenas imagens JPEG, PNG ou WebP são permitidas', 400);
  }

  if (mimeType === 'image/jpeg' && format !== 'jpeg') {
    throw new HttpError('Conteúdo do arquivo não corresponde a uma imagem JPEG', 400);
  }

  if (mimeType === 'image/png' && format !== 'png') {
    throw new HttpError('Conteúdo do arquivo não corresponde a uma imagem PNG', 400);
  }

  if (mimeType === 'image/webp' && format !== 'webp') {
    throw new HttpError('Conteúdo do arquivo não corresponde a uma imagem WebP', 400);
  }

  return format;
}

export async function savePetPhoto(
  petId: string,
  buffer: Buffer,
  mimeType: string | undefined,
) {
  const format = validateImageBuffer(buffer, mimeType);
  const fileId = randomUUID();
  const dirPath = path.join(PETS_UPLOAD_DIR, petId);

  await mkdir(dirPath, { recursive: true });

  const filePath = getPetPhotoFilePath(petId, fileId, format);
  await writeFile(filePath, buffer);

  return {
    fileId,
    photoUrl: getPetPhotoRelativeUrl(petId, fileId, format),
  };
}

export async function deletePetPhotoFile(photoUrl: string | null | undefined) {
  const filePath = resolvePetPhotoPath(photoUrl);

  if (!filePath) {
    return;
  }

  try {
    await unlink(filePath);
  } catch {
    // ignore if file does not exist
  }
}
