/**
 * Returns a URL safe to use in href/src, or undefined if the value is unsafe.
 * Allows relative app paths, blob: previews, and http(s) absolute URLs.
 */
export function getSafeMediaUrl(
  url: string | null | undefined,
): string | undefined {
  if (!url) return undefined;

  const trimmed = url.trim();
  if (!trimmed) return undefined;

  if (trimmed.startsWith('/') && !trimmed.startsWith('//')) {
    return trimmed;
  }

  if (trimmed.startsWith('blob:')) {
    return trimmed;
  }

  try {
    const parsed = new URL(
      trimmed,
      typeof window !== 'undefined' ? window.location.origin : 'https://localhost',
    );
    if (parsed.protocol === 'https:' || parsed.protocol === 'http:') {
      return parsed.href;
    }
  } catch {
    return undefined;
  }

  return undefined;
}
