import * as React from 'react';
import { brandImageSources } from '@/lib/brand-media';
import { cn } from '@/lib/utils';

export type BrandImageProps = Omit<
  React.ImgHTMLAttributes<HTMLImageElement>,
  'src'
> & {
  /** Caminho PNG em /public (ex.: `/dog.png`). */
  src: string;
  /** Above-the-fold: eager + fetchPriority high */
  priority?: boolean;
};

export const BrandImage = React.forwardRef<HTMLImageElement, BrandImageProps>(
  function BrandImage(
    { src, priority = false, className, loading, fetchPriority, decoding, alt, ...props },
    ref,
  ) {
    const { webp, png } = brandImageSources(src);

    return (
      <picture>
        <source srcSet={webp} type="image/webp" />
        <img
          ref={ref}
          src={png}
          alt={alt ?? ''}
          decoding={decoding ?? 'async'}
          loading={loading ?? (priority ? 'eager' : 'lazy')}
          fetchPriority={fetchPriority ?? (priority ? 'high' : 'auto')}
          className={cn(className)}
          {...props}
        />
      </picture>
    );
  },
);
