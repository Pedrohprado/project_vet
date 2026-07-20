import { PawPrint } from 'lucide-react';
import { cn } from '@/lib/utils';
import { PET_SEX_ICONS, PET_SPECIES_ICONS } from '@/lib/pet-icons';
import { PET_SEX_LABELS, PET_SPECIES_LABELS } from '@/types/pet';
import type { PetSex, PetSpecies } from '@/types/tutor';

type PetSelectLabelProps = {
  type: 'species' | 'sex';
  value: PetSpecies | PetSex;
  className?: string;
};

export function PetSelectLabel({ type, value, className }: PetSelectLabelProps) {
  const Icon =
    type === 'species'
      ? (PET_SPECIES_ICONS[value as PetSpecies] ?? PawPrint)
      : PET_SEX_ICONS[value as PetSex];
  const label =
    type === 'species'
      ? PET_SPECIES_LABELS[value as PetSpecies]
      : PET_SEX_LABELS[value as PetSex];

  return (
    <span className={cn('flex items-center gap-2', className)}>
      <Icon className="size-4 shrink-0 text-muted-foreground" aria-hidden="true" />
      <span>{label}</span>
    </span>
  );
}
