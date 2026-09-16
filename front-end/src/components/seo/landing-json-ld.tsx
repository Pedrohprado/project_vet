import { useEffect } from 'react';
import { faqItems } from '@/lib/landing-content';
import {
  absoluteUrl,
  SITE_NAME,
  SITE_URL,
} from '@/lib/seo';

function buildLandingJsonLd() {
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

  const faqPage = {
    '@type': 'FAQPage',
    mainEntity: faqItems.map((item) => ({
      '@type': 'Question',
      name: item.question,
      acceptedAnswer: {
        '@type': 'Answer',
        text: item.answer,
      },
    })),
  };

  return {
    '@context': 'https://schema.org',
    '@graph': [organization, software, webSite, faqPage],
  };
}

const SCRIPT_ID = 'boxvet-landing-jsonld';

/** Injeta JSON-LD Organization / SoftwareApplication / FAQPage na landing. */
export function LandingJsonLd() {
  useEffect(() => {
    const data = buildLandingJsonLd();
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
