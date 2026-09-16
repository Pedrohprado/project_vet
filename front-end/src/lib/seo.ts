export const SITE_URL = 'https://boxvet.app';
export const SITE_NAME = 'BoxVet';
export const OG_IMAGE_PATH = '/og-image.webp';

export const DEFAULT_TITLE =
  'BoxVet — Software para clínicas veterinárias | Pós-consulta e vacinação';

export const DEFAULT_DESCRIPTION =
  'Software para clínicas veterinárias: organize consultas, automatize retornos e vacinação, e continue o cuidado com o tutor depois da consulta.';

export const INDEX_FOLLOW = 'index, follow';
export const NOINDEX_NOFOLLOW = 'noindex, nofollow';

export type SeoConfig = {
  title: string;
  description: string;
  /** Path canônico (ex.: `/`). Sempre resolve para SITE_URL. */
  canonicalPath: string;
  robots: string;
  ogType?: 'website' | 'article';
};

export const splashSeo: SeoConfig = {
  title: DEFAULT_TITLE,
  description: DEFAULT_DESCRIPTION,
  canonicalPath: '/',
  robots: INDEX_FOLLOW,
};

/** Landing desabilitada: manter config pronta para reativar com INDEX_FOLLOW. */
export const landingSeo: SeoConfig = {
  title: DEFAULT_TITLE,
  description: DEFAULT_DESCRIPTION,
  canonicalPath: '/',
  robots: NOINDEX_NOFOLLOW,
};

export const authSeo: SeoConfig = {
  title: `Entrar | ${SITE_NAME}`,
  description: `Acesse sua conta ${SITE_NAME} para gerenciar agenda, consultas e vacinação.`,
  canonicalPath: '/login',
  robots: NOINDEX_NOFOLLOW,
};

export const registerSeo: SeoConfig = {
  title: `Criar conta | ${SITE_NAME}`,
  description: `Cadastre sua clínica no ${SITE_NAME} e comece a organizar atendimentos e pós-consulta.`,
  canonicalPath: '/register',
  robots: NOINDEX_NOFOLLOW,
};

export const forgotPasswordSeo: SeoConfig = {
  title: `Esqueci a senha | ${SITE_NAME}`,
  description: `Redefina sua senha do ${SITE_NAME} com um código enviado por e-mail.`,
  canonicalPath: '/forgot-password',
  robots: NOINDEX_NOFOLLOW,
};

export const levantamentoSeo: SeoConfig = {
  title: `Levantamento | ${SITE_NAME}`,
  description: DEFAULT_DESCRIPTION,
  canonicalPath: '/levantamento',
  robots: NOINDEX_NOFOLLOW,
};

export const appShellSeo: SeoConfig = {
  title: `${SITE_NAME} — App`,
  description: DEFAULT_DESCRIPTION,
  canonicalPath: '/',
  robots: NOINDEX_NOFOLLOW,
};

export const adminShellSeo: SeoConfig = {
  title: `${SITE_NAME} — Admin`,
  description: DEFAULT_DESCRIPTION,
  canonicalPath: '/admin',
  robots: NOINDEX_NOFOLLOW,
};

export const subscriptionSeo: SeoConfig = {
  title: `Assinatura | ${SITE_NAME}`,
  description: DEFAULT_DESCRIPTION,
  canonicalPath: '/assinatura',
  robots: NOINDEX_NOFOLLOW,
};

export function absoluteUrl(path: string): string {
  if (path.startsWith('http://') || path.startsWith('https://')) {
    return path;
  }
  const normalized = path.startsWith('/') ? path : `/${path}`;
  return `${SITE_URL}${normalized === '/' ? '/' : normalized}`;
}

export function ogImageUrl(): string {
  return absoluteUrl(OG_IMAGE_PATH);
}
