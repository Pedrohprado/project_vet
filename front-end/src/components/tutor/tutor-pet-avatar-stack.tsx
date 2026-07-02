import { PawPrint } from 'lucide-react';
import {
  Avatar,
  AvatarFallback,
  AvatarGroup,
  AvatarGroupCount,
  AvatarImage,
} from '@/components/ui/avatar';
import type { PetSummary } from '@/types/tutor';

const MAX_VISIBLE_PET_AVATARS = 4;

export function TutorPetAvatarStack({ pets }: { pets: PetSummary[] }) {
  if (pets.length === 0) {
    return <span className="text-muted-foreground">—</span>;
  }

  const visiblePets = pets.slice(0, MAX_VISIBLE_PET_AVATARS);
  const overflowCount = pets.length - visiblePets.length;

  return (
    <AvatarGroup className="*:data-[slot=avatar]:size-8 *:data-[slot=avatar-group-count]:size-8">
      {visiblePets.map((pet) => (
        <Avatar key={pet.id} size="sm" title={pet.name}>
          {pet.photoUrl ? <AvatarImage src={pet.photoUrl} alt={pet.name} /> : null}
          <AvatarFallback className="bg-primary/10 text-primary">
            <PawPrint className="size-3.5" />
          </AvatarFallback>
        </Avatar>
      ))}
      {overflowCount > 0 && (
        <AvatarGroupCount className="bg-primary/15 text-xs font-medium text-primary">
          +{overflowCount}
        </AvatarGroupCount>
      )}
    </AvatarGroup>
  );
}
