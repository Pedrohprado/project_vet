import type { ZodError } from 'zod';

export function zodFieldErrors(error: ZodError): Record<string, string> {
  const errors: Record<string, string> = {};

  for (const issue of error.issues) {
    const field = issue.path[0];
    if (typeof field === 'string' && !errors[field]) {
      errors[field] = issue.message;
    }
  }

  return errors;
}

export function getFirstInvalidField(error: ZodError) {
  const field = error.issues[0]?.path[0];
  return typeof field === 'string' ? field : undefined;
}

export function buildFormFieldId(idPrefix: string | undefined, field: string) {
  return idPrefix ? `${idPrefix}-${field}` : field;
}

export function scrollToFormField(fieldId: string) {
  requestAnimationFrame(() => {
    document.getElementById(fieldId)?.scrollIntoView({
      behavior: 'smooth',
      block: 'center',
    });

    document.getElementById(fieldId)?.focus({ preventScroll: true });
  });
}
