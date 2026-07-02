import { useRef, useState } from 'react';
import { Check, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { fetchAddressByCep } from '@/api/address';
import { ApiError } from '@/api/http';
import { Input } from '@/components/ui/input';
import { FormField } from '@/components/ui/form-field';
import { Separator } from '@/components/ui/separator';
import { formatCep, formatCpf, formatPhone, onlyDigits } from '@/lib/masks';
import type { TutorFormData } from '@/lib/tutor-form';

type TutorFormFieldsProps = {
  form: TutorFormData;
  onChange: (field: keyof TutorFormData, value: string) => void;
  idPrefix?: string;
  fieldErrors?: Partial<Record<keyof TutorFormData, string>>;
};

export function TutorFormFields({
  form,
  onChange,
  idPrefix = '',
  fieldErrors,
}: TutorFormFieldsProps) {
  const prefix = idPrefix ? `${idPrefix}-` : '';
  const [isLoadingCep, setIsLoadingCep] = useState(false);
  const [cepLookupSuccess, setCepLookupSuccess] = useState(false);
  const lastFetchedCepRef = useRef('');

  async function lookupCep(rawCep: string) {
    const digits = onlyDigits(rawCep);

    if (digits.length !== 8) return;
    if (lastFetchedCepRef.current === digits) return;

    lastFetchedCepRef.current = digits;
    setIsLoadingCep(true);
    setCepLookupSuccess(false);

    try {
      const address = await fetchAddressByCep(digits);

      onChange('zipCode', formatCep(address.zipCode));
      onChange('street', address.street);
      onChange('neighborhood', address.neighborhood);
      onChange('city', address.city);
      onChange('state', address.state.toUpperCase());

      if (address.complement && !(form.complement ?? '').trim()) {
        onChange('complement', address.complement);
      }

      setCepLookupSuccess(true);
    } catch (error) {
      lastFetchedCepRef.current = '';
      setCepLookupSuccess(false);
      const message =
        error instanceof ApiError ? error.message : 'Não foi possível consultar o CEP';
      toast.error(message);
    } finally {
      setIsLoadingCep(false);
    }
  }

  function handleZipCodeChange(value: string) {
    const formatted = formatCep(value);
    onChange('zipCode', formatted);

    if (onlyDigits(formatted).length < 8) {
      lastFetchedCepRef.current = '';
      setCepLookupSuccess(false);
    }

    if (onlyDigits(formatted).length === 8) {
      void lookupCep(formatted);
    }
  }

  return (
    <div className="space-y-6">
      <div className="space-y-4">
        <p className="text-sm font-medium">Informações básicas</p>
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
          <FormField
            id={`${prefix}name`}
            label="Nome *"
            error={fieldErrors?.name}
            className="md:col-span-2 lg:col-span-3"
          >
            <Input
              id={`${prefix}name`}
              value={form.name}
              aria-invalid={Boolean(fieldErrors?.name)}
              onChange={(e) => onChange('name', e.target.value)}
            />
          </FormField>
          <FormField id={`${prefix}document`} label="CPF" error={fieldErrors?.document}>
            <Input
              id={`${prefix}document`}
              value={form.document}
              aria-invalid={Boolean(fieldErrors?.document)}
              onChange={(e) => onChange('document', formatCpf(e.target.value))}
              placeholder="000.000.000-00"
              inputMode="numeric"
              maxLength={14}
            />
          </FormField>
          <FormField id={`${prefix}mobile`} label="Celular" error={fieldErrors?.mobile}>
            <Input
              id={`${prefix}mobile`}
              value={form.mobile}
              aria-invalid={Boolean(fieldErrors?.mobile)}
              onChange={(e) => onChange('mobile', formatPhone(e.target.value))}
              placeholder="(11) 99999-8888"
              inputMode="tel"
              maxLength={15}
            />
          </FormField>
          <FormField
            id={`${prefix}email`}
            label="E-mail"
            error={fieldErrors?.email}
            className="md:col-span-2 lg:col-span-1"
          >
            <Input
              id={`${prefix}email`}
              type="email"
              value={form.email}
              aria-invalid={Boolean(fieldErrors?.email)}
              onChange={(e) => onChange('email', e.target.value)}
            />
          </FormField>
          <FormField
            id={`${prefix}notes`}
            label="Observações"
            error={fieldErrors?.notes}
            className="md:col-span-2 lg:col-span-3"
          >
            <Input
              id={`${prefix}notes`}
              value={form.notes}
              aria-invalid={Boolean(fieldErrors?.notes)}
              onChange={(e) => onChange('notes', e.target.value)}
            />
          </FormField>
        </div>
      </div>

      <Separator />

      <div className="space-y-4">
        <p className="text-sm font-medium">Endereço</p>
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
          <FormField id={`${prefix}zipCode`} label="CEP" error={fieldErrors?.zipCode}>
            <div className="relative">
              <Input
                id={`${prefix}zipCode`}
                value={form.zipCode}
                disabled={isLoadingCep}
                aria-invalid={Boolean(fieldErrors?.zipCode)}
                onChange={(e) => handleZipCodeChange(e.target.value)}
                onBlur={() => void lookupCep(form.zipCode ?? '')}
                placeholder="00000-000"
                inputMode="numeric"
                maxLength={9}
                className="pr-9"
              />
              {isLoadingCep ? (
                <Loader2 className="absolute top-1/2 right-2.5 size-4 -translate-y-1/2 animate-spin text-muted-foreground" />
              ) : cepLookupSuccess ? (
                <Check
                  className="absolute top-1/2 right-2.5 size-4 -translate-y-1/2 text-emerald-600"
                  aria-hidden="true"
                />
              ) : null}
            </div>
          </FormField>
          <FormField
            id={`${prefix}street`}
            label="Logradouro"
            error={fieldErrors?.street}
            className="md:col-span-2 lg:col-span-2"
          >
            <Input
              id={`${prefix}street`}
              value={form.street}
              aria-invalid={Boolean(fieldErrors?.street)}
              onChange={(e) => onChange('street', e.target.value)}
            />
          </FormField>
          <FormField id={`${prefix}number`} label="Número" error={fieldErrors?.number}>
            <Input
              id={`${prefix}number`}
              value={form.number}
              aria-invalid={Boolean(fieldErrors?.number)}
              onChange={(e) => onChange('number', e.target.value)}
            />
          </FormField>
          <FormField
            id={`${prefix}complement`}
            label="Complemento"
            error={fieldErrors?.complement}
            className="md:col-span-2 lg:col-span-2"
          >
            <Input
              id={`${prefix}complement`}
              value={form.complement}
              aria-invalid={Boolean(fieldErrors?.complement)}
              onChange={(e) => onChange('complement', e.target.value)}
            />
          </FormField>
          <FormField
            id={`${prefix}neighborhood`}
            label="Bairro"
            error={fieldErrors?.neighborhood}
          >
            <Input
              id={`${prefix}neighborhood`}
              value={form.neighborhood}
              aria-invalid={Boolean(fieldErrors?.neighborhood)}
              onChange={(e) => onChange('neighborhood', e.target.value)}
            />
          </FormField>
          <FormField id={`${prefix}city`} label="Cidade" error={fieldErrors?.city}>
            <Input
              id={`${prefix}city`}
              value={form.city}
              aria-invalid={Boolean(fieldErrors?.city)}
              onChange={(e) => onChange('city', e.target.value)}
            />
          </FormField>
          <FormField id={`${prefix}state`} label="UF" error={fieldErrors?.state}>
            <Input
              id={`${prefix}state`}
              value={form.state}
              aria-invalid={Boolean(fieldErrors?.state)}
              onChange={(e) => onChange('state', e.target.value.toUpperCase())}
              maxLength={2}
              placeholder="SP"
            />
          </FormField>
        </div>
      </div>
    </div>
  );
}
