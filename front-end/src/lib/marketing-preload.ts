import {
  BIRD_SRC,
  CAT_SRC,
  DOG_SRC,
  FLYBIRD_SRC,
  LOGO_BOX_SRC,
  LOGO_SRC,
  OPEN_BOX_SRC,
  VETERINARY_WOMEN_SRC,
} from '@/lib/brand';

/** Splash / entrada deslogada (/) */
export const SPLASH_PRELOAD_PNGS = [
  LOGO_BOX_SRC,
  DOG_SRC,
  CAT_SRC,
  BIRD_SRC,
] as const;

/** Landing marketing */
export const LANDING_HERO_PRELOAD_PNGS = [CAT_SRC, BIRD_SRC] as const;

/** Login / register */
export const AUTH_PRELOAD_PNGS = [BIRD_SRC, LOGO_SRC, LOGO_BOX_SRC] as const;

/** Seções abaixo da dobra — preload leve após hero (opcional, via hook na landing) */
export const LANDING_BELOW_FOLD_PRELOAD_PNGS = [
  OPEN_BOX_SRC,
  VETERINARY_WOMEN_SRC,
  FLYBIRD_SRC,
] as const;

export const LANDING_PRELOAD_PNGS = [
  ...LANDING_HERO_PRELOAD_PNGS,
  ...LANDING_BELOW_FOLD_PRELOAD_PNGS,
] as const;
