import { BrandImage } from '@/components/brand/brand-image';
import { BIRD_SRC } from '@/lib/brand';
import { cn } from '@/lib/utils';

const birdClassName = 'h-10 w-auto object-contain sm:h-11 md:h-12';

type BrandCardBirdsProps = {
  /** Quantidade de passarinhos visíveis (2 padrão, 3 na splash). */
  count?: 2 | 3;
  className?: string;
  priority?: boolean;
};

/**
 * Passarinhos pousados na borda superior do card — mesmo alinhamento do login.
 */
export function BrandCardBirds({
  count = 2,
  className,
  priority = false,
}: BrandCardBirdsProps) {
  return (
    <div
      className={cn(
        'pointer-events-none absolute top-0 right-6 z-20 flex translate-y-[-58%] items-end gap-1 sm:right-10 sm:gap-2',
        className,
      )}
      aria-hidden
    >
      {count === 3 ? (
        <BrandImage
          src={BIRD_SRC}
          alt=""
          priority={priority}
          className={cn(birdClassName, 'hidden -scale-x-100 md:block')}
        />
      ) : null}
      <BrandImage src={BIRD_SRC} alt="" priority={priority} className={birdClassName} />
      <BrandImage src={BIRD_SRC} alt="" priority={priority} className={birdClassName} />
    </div>
  );
}
