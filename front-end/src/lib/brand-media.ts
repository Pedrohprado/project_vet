/** Caminho WebP correspondente a um PNG de marca em /public. */
export function brandWebpSrc(pngSrc: string): string {
  return pngSrc.replace(/\.png$/i, '.webp');
}

export type BrandImageSources = {
  webp: string;
  png: string;
};

export function brandImageSources(pngSrc: string): BrandImageSources {
  return {
    webp: brandWebpSrc(pngSrc),
    png: pngSrc,
  };
}
