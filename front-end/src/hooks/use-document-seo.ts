import { useEffect } from 'react';
import {
  absoluteUrl,
  ogImageUrl,
  type SeoConfig,
} from '@/lib/seo';

function upsertMetaByName(name: string, content: string) {
  let el = document.querySelector(`meta[name="${name}"]`);
  if (!el) {
    el = document.createElement('meta');
    el.setAttribute('name', name);
    document.head.appendChild(el);
  }
  el.setAttribute('content', content);
}

function upsertMetaByProperty(property: string, content: string) {
  let el = document.querySelector(`meta[property="${property}"]`);
  if (!el) {
    el = document.createElement('meta');
    el.setAttribute('property', property);
    document.head.appendChild(el);
  }
  el.setAttribute('content', content);
}

function upsertCanonical(href: string) {
  let el = document.querySelector('link[rel="canonical"]');
  if (!el) {
    el = document.createElement('link');
    el.setAttribute('rel', 'canonical');
    document.head.appendChild(el);
  }
  el.setAttribute('href', href);
}

/** Atualiza title, description, robots, OG/Twitter e canonical no document. */
export function useDocumentSeo(config: SeoConfig) {
  useEffect(() => {
    const canonical = absoluteUrl(config.canonicalPath);
    const image = ogImageUrl();
    const ogType = config.ogType ?? 'website';

    document.title = config.title;
    upsertMetaByName('description', config.description);
    upsertMetaByName('robots', config.robots);
    upsertCanonical(canonical);

    upsertMetaByProperty('og:type', ogType);
    upsertMetaByProperty('og:url', canonical);
    upsertMetaByProperty('og:title', config.title);
    upsertMetaByProperty('og:description', config.description);
    upsertMetaByProperty('og:image', image);

    upsertMetaByName('twitter:card', 'summary_large_image');
    upsertMetaByName('twitter:title', config.title);
    upsertMetaByName('twitter:description', config.description);
    upsertMetaByName('twitter:image', image);
  }, [
    config.title,
    config.description,
    config.canonicalPath,
    config.robots,
    config.ogType,
  ]);
}
