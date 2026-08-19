import type { ReactNode } from 'react';
import { displayApproximateAge } from '@/lib/community-age';
import { cn } from '@/lib/utils';
import { PET_SEX_ICONS, PET_SPECIES_ICONS } from '@/lib/pet-icons';
import { PET_SEX_LABELS, PET_SPECIES_LABELS } from '@/types/pet';
import type { PetSex, PetSpecies } from '@/types/tutor';
import type { CommunityCase } from '@/types/community';

type CommunityCaseMetaProps = {
  communityCase: Pick<
    CommunityCase,
    'species' | 'sex' | 'approximateAge' | 'weightKg'
  >;
  className?: string;
  showVitals?: boolean;
};

function chipClassName(className?: string) {
  return cn(
    'inline-flex items-center gap-1 rounded-full border border-border/70 bg-muted/50 px-2 py-0.5 text-xs font-medium text-foreground',
    className,
  );
}

function SpeciesChip({ species }: { species: PetSpecies }) {
  const Icon = PET_SPECIES_ICONS[species];
  return (
    <span className={chipClassName()} title={PET_SPECIES_LABELS[species]}>
      <Icon className="size-3.5 shrink-0" aria-hidden />
      {PET_SPECIES_LABELS[species]}
    </span>
  );
}

function SexChip({ sex }: { sex: PetSex }) {
  const Icon = PET_SEX_ICONS[sex];
  return (
    <span
      className={chipClassName(
        cn(
          sex === 'MALE' &&
            'border-sky-700/20 bg-sky-700/10 text-sky-800 dark:text-sky-300',
          sex === 'FEMALE' &&
            'border-rose-500/20 bg-rose-500/10 text-rose-800 dark:text-rose-300',
        ),
      )}
      title={PET_SEX_LABELS[sex]}
    >
      <Icon className="size-3.5 shrink-0" aria-hidden />
      {PET_SEX_LABELS[sex]}
    </span>
  );
}

export function CommunityCaseMeta({
  communityCase,
  className,
  showVitals = false,
}: CommunityCaseMetaProps) {
  const extra: { key: string; node: ReactNode }[] = [];

  if (communityCase.approximateAge) {
    extra.push({
      key: 'age',
      node: (
        <span className={chipClassName()}>
          {displayApproximateAge(communityCase.approximateAge)}
        </span>
      ),
    });
  }

  if (showVitals && communityCase.weightKg) {
    extra.push({
      key: 'weight',
      node: (
        <span className={chipClassName()}>{communityCase.weightKg} kg</span>
      ),
    });
  }

  return (
    <div className={cn('flex flex-wrap items-center gap-1.5', className)}>
      <SpeciesChip species={communityCase.species} />
      <SexChip sex={communityCase.sex} />
      {extra.map((item) => (
        <span key={item.key}>{item.node}</span>
      ))}
    </div>
  );
}
