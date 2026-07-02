import { cn } from '@/lib/utils';

type BrandPageBackgroundProps = {
  variant?: 'fixed' | 'absolute';
  blurHeight?: string;
  className?: string;
};

export function BrandPageBackground({
  variant = 'fixed',
  blurHeight = '40%',
  className,
}: BrandPageBackgroundProps) {
  const positionClass = variant === 'fixed' ? 'fixed' : 'absolute';

  return (
    <>
      <div
        className={cn(
          'auth-grid-bg pointer-events-none inset-0',
          positionClass,
          className,
        )}
        aria-hidden
      />
      <div
        className={cn(
          'auth-yellow-blur pointer-events-none inset-x-0 bottom-0',
          positionClass,
          className,
        )}
        style={{ height: blurHeight }}
        aria-hidden
      />
    </>
  );
}
