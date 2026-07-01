import { z } from 'zod';
import { formatCpf, formatPhone } from '@/lib/masks';
import type { CreateTutorPayload, Tutor, UpdateTutorPayload } from '@/types/tutor';

export const tutorFormSchema = z.object({
  name: z.string().min(1, 'Nome é obrigatório'),
  document: z.string().optional(),
  mobile: z.string().optional(),
  email: z.string().email('E-mail inválido').optional().or(z.literal('')),
  zipCode: z.string().optional(),
  street: z.string().optional(),
  number: z.string().optional(),
  complement: z.string().optional(),
  neighborhood: z.string().optional(),
  city: z.string().optional(),
  state: z.string().optional(),
  notes: z.string().optional(),
});

export type TutorFormData = z.infer<typeof tutorFormSchema>;

export const emptyTutorFormData: TutorFormData = {
  name: '',
  document: '',
  mobile: '',
  email: '',
  zipCode: '',
  street: '',
  number: '',
  complement: '',
  neighborhood: '',
  city: '',
  state: '',
  notes: '',
};

function optionalField(value: string | undefined) {
  return value?.trim() || undefined;
}

export function tutorToFormData(tutor: Tutor): TutorFormData {
  const mobile = tutor.phone ?? tutor.whatsapp ?? '';

  return {
    name: tutor.name,
    document: tutor.document ? formatCpf(tutor.document) : '',
    mobile: mobile ? formatPhone(mobile) : '',
    email: tutor.email ?? '',
    zipCode: tutor.zipCode ?? '',
    street: tutor.street ?? '',
    number: tutor.number ?? '',
    complement: tutor.complement ?? '',
    neighborhood: tutor.neighborhood ?? '',
    city: tutor.city ?? '',
    state: tutor.state ?? '',
    notes: tutor.notes ?? '',
  };
}

export function formDataToCreatePayload(data: TutorFormData): CreateTutorPayload {
  const celular = optionalField(data.mobile);

  return {
    name: data.name,
    document: optionalField(data.document),
    phone: celular,
    whatsapp: celular,
    email: optionalField(data.email),
    zipCode: optionalField(data.zipCode),
    street: optionalField(data.street),
    number: optionalField(data.number),
    complement: optionalField(data.complement),
    neighborhood: optionalField(data.neighborhood),
    city: optionalField(data.city),
    state: optionalField(data.state),
    notes: optionalField(data.notes),
  };
}

export function formDataToUpdatePayload(data: TutorFormData): UpdateTutorPayload {
  return formDataToCreatePayload(data);
}
