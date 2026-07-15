import { Checkbox } from '@/components/ui/checkbox';
import { DatePicker } from '@/components/ui/date-picker';
import { FormField } from '@/components/ui/form-field';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  PET_SEX_SELECT_ITEMS,
  PET_SPECIES_SELECT_ITEMS,
  PetSelectLabel,
} from '@/components/pet/pet-select-label';
import {
  PetPhotoField,
  type PetPhotoSelection,
} from '@/components/pet/pet-photo-field';
import { Separator } from '@/components/ui/separator';
import type { PetFormData } from '@/lib/pet-form';
import type { PetSex, PetSpecies } from '@/types/tutor';

type PetFormFieldsProps = {
  form: PetFormData;
  onChange: <K extends keyof PetFormData>(field: K, value: PetFormData[K]) => void;
  idPrefix?: string;
  fieldErrors?: Partial<Record<keyof PetFormData, string>>;
  photo?: PetPhotoSelection;
  onPhotoChange?: (value: PetPhotoSelection) => void;
  currentPhotoUrl?: string | null;
  photoDisabled?: boolean;
};

export function PetFormFields({
  form,
  onChange,
  idPrefix = '',
  fieldErrors,
  photo,
  onPhotoChange,
  currentPhotoUrl = null,
  photoDisabled = false,
}: PetFormFieldsProps) {
  const prefix = idPrefix ? `${idPrefix}-` : '';

  return (
    <div className="space-y-6">
      {photo && onPhotoChange ? (
        <>
          <PetPhotoField
            petName={form.name || 'Pet'}
            currentPhotoUrl={currentPhotoUrl}
            value={photo}
            onChange={onPhotoChange}
            idPrefix={prefix || undefined}
            disabled={photoDisabled}
          />
          <Separator />
        </>
      ) : null}

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
          <FormField
            id={`${prefix}species`}
            label="Espécie *"
            error={fieldErrors?.species}
          >
            <Select
              items={PET_SPECIES_SELECT_ITEMS}
              value={form.species}
              onValueChange={(value) =>
                onChange('species', value as PetFormData['species'])
              }
            >
              <SelectTrigger
                id={`${prefix}species`}
                className="w-full"
                aria-invalid={Boolean(fieldErrors?.species)}
              >
                <SelectValue placeholder="Selecione a espécie">
                  {(value: PetSpecies | null) =>
                    value ? <PetSelectLabel type="species" value={value} /> : null
                  }
                </SelectValue>
              </SelectTrigger>
              <SelectContent>
                {PET_SPECIES_SELECT_ITEMS.map((item) => (
                  <SelectItem key={item.value} value={item.value}>
                    <PetSelectLabel type="species" value={item.value as PetSpecies} />
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </FormField>
          <FormField id={`${prefix}sex`} label="Sexo" error={fieldErrors?.sex}>
            <Select
              items={PET_SEX_SELECT_ITEMS}
              value={form.sex}
              onValueChange={(value) => onChange('sex', value as PetFormData['sex'])}
            >
              <SelectTrigger
                id={`${prefix}sex`}
                className="w-full"
                aria-invalid={Boolean(fieldErrors?.sex)}
              >
                <SelectValue placeholder="Selecione o sexo">
                  {(value: PetSex | null) =>
                    value ? <PetSelectLabel type="sex" value={value} /> : null
                  }
                </SelectValue>
              </SelectTrigger>
              <SelectContent>
                {PET_SEX_SELECT_ITEMS.map((item) => (
                  <SelectItem key={item.value} value={item.value}>
                    <PetSelectLabel type="sex" value={item.value as PetSex} />
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </FormField>
          <FormField id={`${prefix}breed`} label="Raça" error={fieldErrors?.breed}>
            <Input
              id={`${prefix}breed`}
              value={form.breed}
              aria-invalid={Boolean(fieldErrors?.breed)}
              onChange={(e) => onChange('breed', e.target.value)}
            />
          </FormField>
          <FormField
            id={`${prefix}birthDate`}
            label="Data de nascimento"
            error={fieldErrors?.birthDate}
          >
            <DatePicker
              id={`${prefix}birthDate`}
              value={form.birthDate ?? ''}
              onChange={(birthDate) => onChange('birthDate', birthDate)}
              toDate={new Date()}
            />
          </FormField>
          <FormField
            id={`${prefix}weightKg`}
            label="Peso (kg)"
            error={fieldErrors?.weightKg}
          >
            <Input
              id={`${prefix}weightKg`}
              type="number"
              step="0.01"
              value={form.weightKg}
              aria-invalid={Boolean(fieldErrors?.weightKg)}
              onChange={(e) => onChange('weightKg', e.target.value)}
            />
          </FormField>
          <FormField
            id={`${prefix}color`}
            label="Cor"
            error={fieldErrors?.color}
            className="md:col-span-2 lg:col-span-1"
          >
            <Input
              id={`${prefix}color`}
              value={form.color}
              aria-invalid={Boolean(fieldErrors?.color)}
              onChange={(e) => onChange('color', e.target.value)}
              placeholder="Ex.: Preto e branco"
            />
          </FormField>
        </div>
      </div>

      <Separator />

      <div className="space-y-4">
        <p className="text-sm font-medium">Informações de saúde</p>
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
          <FormField
            id={`${prefix}allergies`}
            label="Alergias"
            error={fieldErrors?.allergies}
            className="md:col-span-2 lg:col-span-3"
          >
            <Input
              id={`${prefix}allergies`}
              value={form.allergies}
              aria-invalid={Boolean(fieldErrors?.allergies)}
              onChange={(e) => onChange('allergies', e.target.value)}
            />
          </FormField>
          <div className="flex min-h-11 items-center gap-3">
            <Checkbox
              id={`${prefix}isCastrated`}
              checked={form.isCastrated}
              onCheckedChange={(checked) => onChange('isCastrated', checked === true)}
            />
            <Label htmlFor={`${prefix}isCastrated`} className="cursor-pointer">
              Castrado
            </Label>
          </div>
        </div>
      </div>
    </div>
  );
}
