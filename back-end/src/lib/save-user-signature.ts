import { mkdir, unlink, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { HttpError } from '../services/erros/http-error.js';

const MAX_SIGNATURE_BYTES = 500 * 1024;
const SIGNATURE_DIR = path.resolve('uploads/signatures');

const PNG_DATA_URL_PATTERN = /^data:image\/png;base64,(.+)$/;

export function getSignatureRelativeUrl(userId: string) {
  return `/uploads/signatures/${userId}.png`;
}

export function getSignatureFilePath(userId: string) {
  return path.join(SIGNATURE_DIR, `${userId}.png`);
}

export function resolveSignatureFilePath(signatureUrl: string | null | undefined) {
  if (!signatureUrl) return null;

  const match = signatureUrl.match(/^\/uploads\/signatures\/([a-f0-9-]+)\.png$/i);
  if (!match) return null;

  return getSignatureFilePath(match[1]!);
}

export async function saveUserSignature(userId: string, dataUrl: string) {
  const match = PNG_DATA_URL_PATTERN.exec(dataUrl.trim());

  if (!match?.[1]) {
    throw new HttpError('Assinatura inválida. Envie uma imagem PNG.', 400);
  }

  const buffer = Buffer.from(match[1], 'base64');

  if (buffer.length === 0) {
    throw new HttpError('Assinatura vazia', 400);
  }

  if (buffer.length > MAX_SIGNATURE_BYTES) {
    throw new HttpError('Assinatura excede o tamanho máximo de 500 KB', 400);
  }

  await mkdir(SIGNATURE_DIR, { recursive: true });

  const filePath = getSignatureFilePath(userId);

  try {
    await unlink(filePath);
  } catch {
    // ignore if file does not exist yet
  }

  await writeFile(filePath, buffer);

  return getSignatureRelativeUrl(userId);
}

export async function deleteUserSignature(userId: string) {
  const filePath = getSignatureFilePath(userId);

  try {
    await unlink(filePath);
  } catch {
    // ignore if file does not exist
  }
}
