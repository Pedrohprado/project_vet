import { PawPrint } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { cn } from '@/lib/utils';
import type { PetSummary } from '@/types/tutor';

type PetAvatarPet = Pick<PetSummary, 'name' | 'photoUrl'>;

type PetAvatarProps = {
  pet: PetAvatarPet;
  size?: 'sm' | 'lg';
  className?: string;
};

const sizeClasses = {
  sm: {
    avatar: 'size-8',
    icon: 'size-3.5',
  },
  lg: {
    avatar: 'size-16 sm:size-20',
    icon: 'size-7 sm:size-8',
  },
} as const;

export function PetAvatar({ pet, size = 'sm', className }: PetAvatarProps) {
  const sizes = sizeClasses[size];

  return (
    <Avatar
      size={size === 'sm' ? 'sm' : 'default'}
      title={pet.name}
      className={cn(sizes.avatar, 'shrink-0', className)}
    >
      {pet.photoUrl ? <AvatarImage src={pet.photoUrl} alt={pet.name} /> : null}
      <AvatarFallback className="bg-primary/10 text-primary">
        <PawPrint className={sizes.icon} />
      </AvatarFallback>
    </Avatar>
  );
}
