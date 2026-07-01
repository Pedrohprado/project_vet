import { APP_NAME, LOGO_SRC } from '@/lib/brand';
import { cn } from '@/lib/utils';

const sizeClasses = {
  sm: 'h-8 w-8',
  md: 'h-12 w-12',
  lg: 'h-16 w-16',
  xl: 'h-28 w-28',
  '2xl': 'h-40 w-40',
} as const;

type BrandLogoProps = {
  size?: keyof typeof sizeClasses;
  showName?: boolean;
  className?: string;
};

export function BrandLogo({
  size = 'md',
  showName = false,
  className,
}: BrandLogoProps) {
  return (
    <div className={cn('flex items-center gap-3', className)}>
      <img
        src={LOGO_SRC}
        alt={APP_NAME}
        className={cn('object-contain', sizeClasses[size])}
      />
      {showName ? (
        <span className="text-lg font-semibold tracking-tight">{APP_NAME}</span>
      ) : null}
    </div>
  );
}
