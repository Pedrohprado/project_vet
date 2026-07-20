import type { ReactNode } from 'react';
import { displayApproximateAge } from '@/lib/community-age';
import { cn } from '@/lib/utils';
import { PET_SEX_ICONS, PET_SPECIES_ICONS } from '@/lib/pet-icons';
import { PET_SEX_LABELS, PET_SPECIES_LABELS } from '@/types/pet';
import type { CommunityCase } from '@/types/community';

type CommunityCaseMetaProps = {
  communityCase: Pick<
    CommunityCase,
    'species' | 'sex' | 'approximateAge' | 'weightKg'
  >;
  className?: string;
  showVitals?: boolean;
};

export function CommunityCaseMeta({
  communityCase,
  className,
  showVitals = false,
}: CommunityCaseMetaProps) {
  const SpeciesIcon = PET_SPECIES_ICONS[communityCase.species];
  const SexIcon = PET_SEX_ICONS[communityCase.sex];

  const items = [
    {
      key: 'species',
      node: (
        <span
          className="inline-flex items-center gap-1.5"
          title={PET_SPECIES_LABELS[communityCase.species]}
        >
          <SpeciesIcon className="size-4 shrink-0" aria-hidden />
          {PET_SPECIES_LABELS[communityCase.species]}
        </span>
      ),
    },
    {
      key: 'sex',
      node: (
        <span
          className={cn(
            'inline-flex items-center gap-1.5',
            communityCase.sex === 'MALE' && 'text-sky-600 dark:text-sky-400',
            communityCase.sex === 'FEMALE' && 'text-rose-600 dark:text-rose-400',
          )}
          title={PET_SEX_LABELS[communityCase.sex]}
        >
          <SexIcon className="size-4 shrink-0" aria-hidden />
          {PET_SEX_LABELS[communityCase.sex]}
        </span>
      ),
    },
    communityCase.approximateAge
      ? {
          key: 'age',
          node: (
            <span>{displayApproximateAge(communityCase.approximateAge)}</span>
          ),
        }
      : null,
    showVitals && communityCase.weightKg
      ? { key: 'weight', node: <span>{communityCase.weightKg} kg</span> }
      : null,
  ].filter(Boolean) as { key: string; node: ReactNode }[];

  return (
    <div
      className={cn(
        'flex flex-wrap items-center gap-x-2.5 gap-y-1 text-xs text-muted-foreground sm:text-sm',
        className,
      )}
    >
      {items.map((item, index) => (
        <span key={item.key} className="inline-flex items-center gap-x-2.5">
          {index > 0 ? (
            <span
              aria-hidden
              className="h-3 w-px shrink-0 bg-border"
            />
          ) : null}
          {item.node}
        </span>
      ))}
    </div>
  );
}
