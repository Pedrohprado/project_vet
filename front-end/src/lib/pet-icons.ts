import {
  Bird,
  Cat,
  CircleHelp,
  Dog,
  Fish,
  Mars,
  PawPrint,
  Rabbit,
  Rat,
  Squirrel,
  Turtle,
  Venus,
  type LucideIcon,
} from 'lucide-react';
import type { PetSex, PetSpecies } from '@/types/tutor';

export const PET_SPECIES_ICONS: Record<PetSpecies, LucideIcon> = {
  DOG: Dog,
  CAT: Cat,
  BIRD: Bird,
  RABBIT: Rabbit,
  RODENT: Rat,
  FERRET: Squirrel,
  REPTILE: Turtle,
  FISH: Fish,
  OTHER: PawPrint,
};

export const PET_SEX_ICONS: Record<PetSex, LucideIcon> = {
  MALE: Mars,
  FEMALE: Venus,
  UNKNOWN: CircleHelp,
};

export function getAuthorInitials(name: string) {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return '?';
  if (parts.length === 1) return parts[0]!.slice(0, 2).toUpperCase();
  return `${parts[0]![0] ?? ''}${parts[parts.length - 1]![0] ?? ''}`.toUpperCase();
}
