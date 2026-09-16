import { useEffect } from 'react';
import {
  absoluteUrl,
  SITE_NAME,
  SITE_URL,
} from '@/lib/seo';

function buildHomeJsonLd() {
  const logoUrl = absoluteUrl('/new_logo.webp');

  const organization = {
    '@type': 'Organization',
    '@id': `${SITE_URL}/#organization`,
    name: SITE_NAME,
    url: SITE_URL,
    logo: logoUrl,
    description:
      'Software para clínicas veterinárias focado em pós-consulta, vacinação e continuidade do cuidado.',
  };

  const software = {
    '@type': 'SoftwareApplication',
    name: SITE_NAME,
    applicationCategory: 'BusinessApplication',
    operatingSystem: 'Web',
    url: SITE_URL,
    description:
      'Organize consultas, automatize retornos e vacinação, e continue o cuidado com o tutor depois da consulta.',
    offers: {
      '@type': 'Offer',
      price: '0',
      priceCurrency: 'BRL',
      description: 'Lista de espera — planos em breve',
    },
    publisher: { '@id': `${SITE_URL}/#organization` },
  };

  const webSite = {
    '@type': 'WebSite',
    '@id': `${SITE_URL}/#website`,
    url: SITE_URL,
    name: SITE_NAME,
    publisher: { '@id': `${SITE_URL}/#organization` },
    inLanguage: 'pt-BR',
  };

  return {
    '@context': 'https://schema.org',
    '@graph': [organization, software, webSite],
  };
}

const SCRIPT_ID = 'boxvet-home-jsonld';

/** JSON-LD da home pública (Splash). FAQ fica na landing quando for reativada. */
export function HomeJsonLd() {
  useEffect(() => {
    const data = buildHomeJsonLd();
    let script = document.getElementById(SCRIPT_ID) as HTMLScriptElement | null;

    if (!script) {
      script = document.createElement('script');
      script.id = SCRIPT_ID;
      script.type = 'application/ld+json';
      document.head.appendChild(script);
    }

    script.textContent = JSON.stringify(data);

    return () => {
      script?.remove();
    };
  }, []);

  return null;
}
