import { useEffect } from 'react';
import { brandWebpSrc } from '@/lib/brand-media';

/**
 * Dispara preload de imagens WebP o logo após montagem (complementa link no HTML).
 * Aceita caminhos PNG de marca; ignora entradas vazias.
 */
export function usePreloadBrandImages(pngSrcs: readonly string[]) {
  const preloadKey = pngSrcs.join('|');

  useEffect(() => {
    const hrefs = [
      ...new Set(
        preloadKey
          .split('|')
          .filter(Boolean)
          .map((src) => brandWebpSrc(src)),
      ),
    ];
    const links: HTMLLinkElement[] = [];

    for (const href of hrefs) {
      const existing = document.querySelector(
        `link[rel="preload"][as="image"][href="${href}"]`,
      );
      if (existing) {
        continue;
      }

      const link = document.createElement('link');
      link.rel = 'preload';
      link.as = 'image';
      link.href = href;
      link.type = 'image/webp';
      document.head.appendChild(link);
      links.push(link);
    }

    return () => {
      for (const link of links) {
        link.remove();
      }
    };
  }, [preloadKey]);
}
