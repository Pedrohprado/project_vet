import { z } from 'zod';

export const prescriptionFormFields = [
  'medicineName',
  'routeOfAdministration',
  'customRoute',
  'pharmacyType',
  'quantity',
  'dosage',
  'frequency',
  'duration',
  'instructions',
] as const;

export type PrescriptionFormField = (typeof prescriptionFormFields)[number];

export const prescriptionFormSchema = z
  .object({
    medicineName: z.string().trim().min(1, 'Medicamento é obrigatório'),
    routeOfAdministration: z.string().trim().min(1, 'Via de administração é obrigatória'),
    customRoute: z.string().optional(),
    pharmacyType: z.enum(['HUMAN', 'VETERINARY'], {
      message: 'Tipo de farmácia é obrigatório',
    }),
    quantity: z.string().trim().min(1, 'Quantidade é obrigatória'),
    dosage: z.string().trim().min(1, 'Dosagem é obrigatória'),
    frequency: z.string().trim().min(1, 'Frequência é obrigatória'),
    duration: z.string().trim().min(1, 'Duração é obrigatória'),
    instructions: z.string().trim().min(1, 'Instruções são obrigatórias'),
  })
  .superRefine((data, ctx) => {
    if (data.routeOfAdministration === 'OUTRO' && !data.customRoute?.trim()) {
      ctx.addIssue({
        code: 'custom',
        message: 'Via personalizada é obrigatória',
        path: ['customRoute'],
      });
    }
  });

export type PrescriptionFormValues = z.infer<typeof prescriptionFormSchema>;
