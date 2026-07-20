import { onlyDigits } from '@/lib/masks';
import type { Prescription } from '@/types/consultation';

export type ConsultationWhatsAppMessageInput = {
  tutorName: string;
  petName: string;
  petSpecies?: string | null;
  diagnosis?: string | null;
  conduct?: string | null;
  returnDate?: string | null;
  veterinarianName?: string | null;
  prescriptions?: Prescription[];
};

const SPECIES_EMOJI: Record<string, string> = {
  DOG: '🐶',
  CAT: '🐱',
  BIRD: '🐦',
  RABBIT: '🐰',
  RODENT: '🐹',
  FERRET: '🦦',
  REPTILE: '🦎',
  FISH: '🐟',
  OTHER: '🐾',
};

export function petSpeciesEmoji(species: string | null | undefined): string {
  if (!species) return '🐾';
  return SPECIES_EMOJI[species] ?? '🐾';
}

export function toWhatsAppPhone(phone: string | null | undefined): string | null {
  const digits = onlyDigits(phone ?? '');
  if (!digits) return null;

  if (digits.startsWith('55') && (digits.length === 12 || digits.length === 13)) {
    return digits;
  }

  if (digits.length === 10 || digits.length === 11) {
    return `55${digits}`;
  }

  return null;
}

export function buildWhatsAppUrl(
  phone: string | null | undefined,
  message: string,
): string | null {
  const e164 = toWhatsAppPhone(phone);
  if (!e164) return null;

  return `https://wa.me/${e164}?text=${encodeURIComponent(message)}`;
}

function formatPrescriptionLine(prescription: Prescription): string {
  const details: string[] = [];
  if (prescription.dosage?.trim()) {
    details.push(`dose ${prescription.dosage.trim()}`);
  }
  if (prescription.frequency?.trim()) {
    details.push(`frequência ${prescription.frequency.trim()}`);
  }
  if (prescription.duration?.trim()) {
    details.push(`duração ${prescription.duration.trim()}`);
  }
  if (prescription.instructions?.trim()) {
    details.push(`instruções ${prescription.instructions.trim()}`);
  }

  if (details.length === 0) {
    return prescription.medicineName;
  }

  return `${prescription.medicineName} — ${details.join(', ')}`;
}

export function buildConsultationWhatsAppMessage(
  input: ConsultationWhatsAppMessageInput,
): string {
  const emoji = petSpeciesEmoji(input.petSpecies);
  const petWithEmoji = `${input.petName} ${emoji}`;

  const parts = [
    `Olá ${input.tutorName}!\n\nObrigado por trazer o(a) ${petWithEmoji} para a consulta.`,
  ];

  const diagnosis = input.diagnosis?.trim();
  if (diagnosis) {
    parts.push(`Diagnóstico:\n${diagnosis}`);
  }

  const conduct = input.conduct?.trim();
  if (conduct) {
    parts.push(`Conduta:\n${conduct}`);
  }

  const prescriptions = input.prescriptions ?? [];
  if (prescriptions.length > 0) {
    const lines = prescriptions.map(formatPrescriptionLine).join('\n');
    parts.push(`Receitas:\n${lines}`);
  }

  if (input.returnDate) {
    const dateStr = new Date(input.returnDate).toLocaleString('pt-BR', {
      dateStyle: 'short',
      timeStyle: 'short',
    });
    parts.push(`Retorno agendado para ${dateStr}.`);
  }

  parts.push(
    `Espero que o(a) ${input.petName} fique bem 💛\nQualquer coisa, estou à disposição! 😊`,
  );

  const veterinarianName = input.veterinarianName?.trim();
  if (veterinarianName) {
    parts.push(`Atenciosamente,\n${veterinarianName}`);
  }

  return parts.join('\n\n');
}
