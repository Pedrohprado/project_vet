import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { cn } from '@/lib/utils';
import {
  formatBirthDate,
  formatPetAge,
  formatPetWeight,
} from '@/lib/pet-format';
import { PET_SEX_LABELS, PET_SPECIES_LABELS, type Pet } from '@/types/pet';

const LONG_VALUE_THRESHOLD = 32;

function InfoField({
  label,
  value,
  fullWidth,
}: {
  label: string;
  value: string;
  fullWidth?: boolean;
}) {
  const spanFull = fullWidth ?? value.length > LONG_VALUE_THRESHOLD;

  return (
    <div className={cn('space-y-1', spanFull && 'col-span-2')}>
      <p className="text-xs font-medium text-muted-foreground">{label}</p>
      <p className="text-sm wrap-break-word">{value}</p>
    </div>
  );
}

export function PetRegistrationCard({ pet }: { pet: Pet }) {
  const hasClinicalInfo = Boolean(
    pet.allergies?.trim() ||
      pet.chronicDiseases?.trim() ||
      pet.continuousMedications?.trim() ||
      pet.notes?.trim(),
  );

  return (
    <Card>
      <CardHeader>
        <CardTitle>Informações do cadastro</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="grid grid-cols-2 gap-4">
          <InfoField label="Espécie" value={PET_SPECIES_LABELS[pet.species]} />
          <InfoField label="Sexo" value={PET_SEX_LABELS[pet.sex]} />
          <InfoField label="Raça" value={pet.breed ?? '—'} />
          <InfoField label="Data de nascimento" value={formatBirthDate(pet.birthDate)} />
          <InfoField label="Idade" value={formatPetAge(pet.birthDate)} />
          <InfoField label="Cor" value={pet.color ?? '—'} />
          <InfoField label="Peso" value={formatPetWeight(pet.weightKg)} />
          <InfoField label="Castrado" value={pet.isCastrated ? 'Sim' : 'Não'} />
          <InfoField label="Microchip" value={pet.microchip ?? '—'} />
        </div>

        {hasClinicalInfo && (
          <>
            <Separator />
            <div className="space-y-4">
              <p className="text-sm font-medium">Informações clínicas</p>
              <div className="grid grid-cols-2 gap-4">
                {pet.allergies?.trim() ? (
                  <InfoField label="Alergias" value={pet.allergies} fullWidth />
                ) : null}
                {pet.chronicDiseases?.trim() ? (
                  <InfoField
                    label="Doenças crônicas"
                    value={pet.chronicDiseases}
                    fullWidth
                  />
                ) : null}
                {pet.continuousMedications?.trim() ? (
                  <InfoField
                    label="Medicações contínuas"
                    value={pet.continuousMedications}
                    fullWidth
                  />
                ) : null}
                {pet.notes?.trim() ? (
                  <InfoField label="Observações" value={pet.notes} fullWidth />
                ) : null}
              </div>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
}
