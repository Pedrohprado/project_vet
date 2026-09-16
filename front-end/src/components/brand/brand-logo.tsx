import { BrandImage } from '@/components/brand/brand-image';
import { APP_NAME, LOGO_BOX_SRC, LOGO_SRC } from '@/lib/brand';
import { cn } from '@/lib/utils';

const boxSizeClasses = {
  sm: 'h-8 w-8',
  md: 'h-12 w-12',
} as const;

const fullSizeClasses = {
  lg: 'h-16 w-auto',
  xl: 'h-28 w-auto',
  '2xl': 'h-40 w-auto',
} as const;

const sizeClasses = {
  ...boxSizeClasses,
  ...fullSizeClasses,
} as const;

type BrandLogoProps = {
  size?: keyof typeof sizeClasses;
  showName?: boolean;
  className?: string;
  /** Logo acima da dobra (splash, auth) */
  priority?: boolean;
};

function isFullLogoSize(
  size: keyof typeof sizeClasses,
): size is keyof typeof fullSizeClasses {
  return size === 'lg' || size === 'xl' || size === '2xl';
}

export function BrandLogo({
  size = 'md',
  showName = false,
  className,
  priority = false,
}: BrandLogoProps) {
  const src = isFullLogoSize(size) ? LOGO_SRC : LOGO_BOX_SRC;

  return (
    <div className={cn('flex items-center gap-3', className)}>
      <BrandImage
        src={src}
        alt={APP_NAME}
        priority={priority}
        className={cn('object-contain', sizeClasses[size])}
      />
      {showName ? (
        <span className="text-lg font-semibold tracking-tight">{APP_NAME}</span>
      ) : null}
    </div>
  );
}
