import { PawPrint, Search, VenusAndMars, X } from 'lucide-react';
import { PetSelectLabel } from '@/components/pet/pet-select-label';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
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
} from '@/lib/pet-select';
import type { PetSex, PetSpecies } from '@/types/tutor';

export type CommunityFiltersState = {
  q: string;
  species: string;
  sex: string;
};

type CommunityFiltersProps = {
  filters: CommunityFiltersState;
  onChange: (filters: CommunityFiltersState) => void;
};

const ALL_VALUE = 'all';

const SPECIES_FILTER_ITEMS = [
  { value: ALL_VALUE, label: 'Todas' },
  ...PET_SPECIES_SELECT_ITEMS,
];

const SEX_FILTER_ITEMS = [
  { value: ALL_VALUE, label: 'Todos' },
  ...PET_SEX_SELECT_ITEMS,
];

export function CommunityFilters({ filters, onChange }: CommunityFiltersProps) {
  const hasActiveFilters =
    Boolean(filters.q.trim()) ||
    Boolean(filters.species) ||
    Boolean(filters.sex);

  function update(partial: Partial<CommunityFiltersState>) {
    onChange({ ...filters, ...partial });
  }

  return (
    <div className="flex flex-col gap-2">
      <div className="relative min-w-0 w-full sm:max-w-sm">
        <Search className="absolute top-1/2 left-2.5 size-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          value={filters.q}
          onChange={(event) => update({ q: event.target.value })}
          placeholder="Buscar por título, diagnóstico, autor..."
          className="pl-8"
        />
      </div>

      <div className="flex items-center gap-2">
        <Select
          items={SPECIES_FILTER_ITEMS}
          value={filters.species || ALL_VALUE}
          onValueChange={(value) =>
            update({ species: !value || value === ALL_VALUE ? '' : value })
          }
        >
          <SelectTrigger className="min-w-0 flex-1">
            <SelectValue placeholder="Espécie">
              {(value: string | null) =>
                value && value !== ALL_VALUE ? (
                  <PetSelectLabel type="species" value={value as PetSpecies} />
                ) : (
                  <span className="flex items-center gap-2">
                    <PawPrint className="size-4 shrink-0 text-muted-foreground" />
                    Todas
                  </span>
                )
              }
            </SelectValue>
          </SelectTrigger>
          <SelectContent>
            <SelectItem value={ALL_VALUE}>
              <span className="flex items-center gap-2">
                <PawPrint className="size-4 shrink-0 text-muted-foreground" />
                Todas
              </span>
            </SelectItem>
            {PET_SPECIES_SELECT_ITEMS.map((item) => (
              <SelectItem key={item.value} value={item.value}>
                <PetSelectLabel
                  type="species"
                  value={item.value as PetSpecies}
                />
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select
          items={SEX_FILTER_ITEMS}
          value={filters.sex || ALL_VALUE}
          onValueChange={(value) =>
            update({ sex: !value || value === ALL_VALUE ? '' : value })
          }
        >
          <SelectTrigger className="min-w-0 flex-1">
            <SelectValue placeholder="Sexo">
              {(value: string | null) =>
                value && value !== ALL_VALUE ? (
                  <PetSelectLabel type="sex" value={value as PetSex} />
                ) : (
                  <span className="flex items-center gap-2">
                    <VenusAndMars className="size-4 shrink-0 text-muted-foreground" />
                    Todos
                  </span>
                )
              }
            </SelectValue>
          </SelectTrigger>
          <SelectContent>
            <SelectItem value={ALL_VALUE}>
              <span className="flex items-center gap-2">
                <VenusAndMars className="size-4 shrink-0 text-muted-foreground" />
                Todos
              </span>
            </SelectItem>
            {PET_SEX_SELECT_ITEMS.map((item) => (
              <SelectItem key={item.value} value={item.value}>
                <PetSelectLabel type="sex" value={item.value as PetSex} />
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        {hasActiveFilters ? (
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="shrink-0"
            aria-label="Limpar filtros"
            onClick={() => onChange({ q: '', species: '', sex: '' })}
          >
            <X className="size-4" />
          </Button>
        ) : null}
      </div>
    </div>
  );
}
