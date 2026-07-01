import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { formatCpf, formatPhone } from '@/lib/masks';
import type { TutorFormData } from '@/lib/tutor-form';

type TutorFormFieldsProps = {
  form: TutorFormData;
  onChange: (field: keyof TutorFormData, value: string) => void;
  idPrefix?: string;
};

export function TutorFormFields({ form, onChange, idPrefix = '' }: TutorFormFieldsProps) {
  const prefix = idPrefix ? `${idPrefix}-` : '';

  return (
    <div className="grid grid-cols-1 gap-4">
      <div className="space-y-2">
        <Label htmlFor={`${prefix}name`}>Nome *</Label>
        <Input
          id={`${prefix}name`}
          value={form.name}
          onChange={(e) => onChange('name', e.target.value)}
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor={`${prefix}document`}>CPF</Label>
        <Input
          id={`${prefix}document`}
          value={form.document}
          onChange={(e) => onChange('document', formatCpf(e.target.value))}
          placeholder="000.000.000-00"
          inputMode="numeric"
          maxLength={14}
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor={`${prefix}mobile`}>Celular</Label>
        <Input
          id={`${prefix}mobile`}
          value={form.mobile}
          onChange={(e) => onChange('mobile', formatPhone(e.target.value))}
          placeholder="(11) 99999-8888"
          inputMode="tel"
          maxLength={15}
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor={`${prefix}email`}>E-mail</Label>
        <Input
          id={`${prefix}email`}
          type="email"
          value={form.email}
          onChange={(e) => onChange('email', e.target.value)}
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor={`${prefix}city`}>Cidade</Label>
        <Input
          id={`${prefix}city`}
          value={form.city}
          onChange={(e) => onChange('city', e.target.value)}
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor={`${prefix}notes`}>Observações</Label>
        <Input
          id={`${prefix}notes`}
          value={form.notes}
          onChange={(e) => onChange('notes', e.target.value)}
        />
      </div>
    </div>
  );
}
