import type {
  PrescriptionDocumentType,
  PrescriptionPharmacyType,
} from '@/types/consultation';

export type ConsultationDraftAnamnesis = {
  mainComplaint: string;
  history: string;
  physicalExam: string;
  temperature: string;
  observations: string;
};

export type ConsultationDraftClinical = {
  diagnosis: string;
  conduct: string;
};

export type ConsultationDraftReturnInfo = {
  needsReturn: boolean;
  returnDate: string;
};

export type ConsultationDraftPrescriptionForm = {
  medicineName: string;
  dosage: string;
  frequency: string;
  duration: string;
  instructions: string;
  routeOfAdministration: string;
  customRoute: string;
  pharmacyType: PrescriptionPharmacyType;
  quantity: string;
};

export type ConsultationDraft = {
  anamnesis: ConsultationDraftAnamnesis;
  clinical: ConsultationDraftClinical;
  returnInfo: ConsultationDraftReturnInfo;
  returnDurationMinutes: number;
  returnDurationDigits: string;
  pendingWeightKg: number | null;
  prescriptionDocumentType: PrescriptionDocumentType;
  prescriptionFormOpen: boolean;
  prescriptionForm: ConsultationDraftPrescriptionForm;
};

export function draftStorageKey(consultationId: string) {
  return `consultation-draft-${consultationId}`;
}

function isObject(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function isString(value: unknown): value is string {
  return typeof value === 'string';
}

function isBoolean(value: unknown): value is boolean {
  return typeof value === 'boolean';
}

function isNumber(value: unknown): value is number {
  return typeof value === 'number' && Number.isFinite(value);
}

function parseAnamnesis(value: unknown): ConsultationDraftAnamnesis | null {
  if (!isObject(value)) return null;
  if (
    !isString(value.mainComplaint) ||
    !isString(value.history) ||
    !isString(value.physicalExam) ||
    !isString(value.temperature) ||
    !isString(value.observations)
  ) {
    return null;
  }

  return {
    mainComplaint: value.mainComplaint,
    history: value.history,
    physicalExam: value.physicalExam,
    temperature: value.temperature,
    observations: value.observations,
  };
}

function parseClinical(value: unknown): ConsultationDraftClinical | null {
  if (!isObject(value)) return null;
  if (!isString(value.diagnosis) || !isString(value.conduct)) return null;

  return {
    diagnosis: value.diagnosis,
    conduct: value.conduct,
  };
}

function parseReturnInfo(value: unknown): ConsultationDraftReturnInfo | null {
  if (!isObject(value)) return null;
  if (!isBoolean(value.needsReturn) || !isString(value.returnDate)) return null;

  return {
    needsReturn: value.needsReturn,
    returnDate: value.returnDate,
  };
}

function parsePrescriptionForm(
  value: unknown,
): ConsultationDraftPrescriptionForm | null {
  if (!isObject(value)) return null;
  if (
    !isString(value.medicineName) ||
    !isString(value.dosage) ||
    !isString(value.frequency) ||
    !isString(value.duration) ||
    !isString(value.instructions) ||
    !isString(value.routeOfAdministration) ||
    !isString(value.customRoute) ||
    !isString(value.pharmacyType) ||
    !isString(value.quantity)
  ) {
    return null;
  }

  if (value.pharmacyType !== 'VETERINARY' && value.pharmacyType !== 'HUMAN') {
    return null;
  }

  return {
    medicineName: value.medicineName,
    dosage: value.dosage,
    frequency: value.frequency,
    duration: value.duration,
    instructions: value.instructions,
    routeOfAdministration: value.routeOfAdministration,
    customRoute: value.customRoute,
    pharmacyType: value.pharmacyType,
    quantity: value.quantity,
  };
}

function parseDraft(value: unknown): ConsultationDraft | null {
  if (!isObject(value)) return null;

  const anamnesis = parseAnamnesis(value.anamnesis);
  const clinical = parseClinical(value.clinical);
  const returnInfo = parseReturnInfo(value.returnInfo);
  const prescriptionForm = parsePrescriptionForm(value.prescriptionForm);

  if (!anamnesis || !clinical || !returnInfo || !prescriptionForm) return null;

  if (
    !isNumber(value.returnDurationMinutes) ||
    !isString(value.returnDurationDigits) ||
    !(value.pendingWeightKg === null || isNumber(value.pendingWeightKg)) ||
    !isBoolean(value.prescriptionFormOpen) ||
    (value.prescriptionDocumentType !== 'SIMPLE' &&
      value.prescriptionDocumentType !== 'SPECIAL_CONTROL')
  ) {
    return null;
  }

  return {
    anamnesis,
    clinical,
    returnInfo,
    returnDurationMinutes: value.returnDurationMinutes,
    returnDurationDigits: value.returnDurationDigits,
    pendingWeightKg: value.pendingWeightKg,
    prescriptionDocumentType: value.prescriptionDocumentType,
    prescriptionFormOpen: value.prescriptionFormOpen,
    prescriptionForm,
  };
}

export function readConsultationDraft(
  consultationId: string,
): ConsultationDraft | null {
  try {
    const raw = sessionStorage.getItem(draftStorageKey(consultationId));
    if (raw === null) return null;
    return parseDraft(JSON.parse(raw) as unknown);
  } catch {
    return null;
  }
}

export function writeConsultationDraft(
  consultationId: string,
  draft: ConsultationDraft,
) {
  try {
    sessionStorage.setItem(draftStorageKey(consultationId), JSON.stringify(draft));
  } catch {
    // Quota or private mode — ignore silently.
  }
}

export function clearConsultationDraft(consultationId: string) {
  try {
    sessionStorage.removeItem(draftStorageKey(consultationId));
  } catch {
    // Private mode — ignore silently.
  }
}

const DRAFT_KEY_PREFIX = 'consultation-draft-';

/** Removes all consultation draft keys (call on logout for shared machines). */
export function clearAllConsultationDrafts() {
  try {
    const keysToRemove: string[] = [];
    for (let index = 0; index < sessionStorage.length; index++) {
      const key = sessionStorage.key(index);
      if (key?.startsWith(DRAFT_KEY_PREFIX)) {
        keysToRemove.push(key);
      }
    }
    for (const key of keysToRemove) {
      sessionStorage.removeItem(key);
    }
  } catch {
    // Private mode — ignore silently.
  }
}
