import { useCallback, useState } from 'react';
import type { ZodError } from 'zod';
import {
  buildFormFieldId,
  getFirstInvalidField,
  scrollToFirstFieldError,
  scrollToFormField,
  zodFieldErrors,
} from '@/lib/form-validation';

export function useFormFieldErrors<TField extends string>(idPrefix?: string) {
  const [fieldErrors, setFieldErrors] = useState<Partial<Record<TField, string>>>(
    {},
  );
  const [formError, setFormError] = useState<string>();

  const applyZodError = useCallback(
    (error: ZodError, fieldOrder?: readonly TField[]) => {
      const errors = zodFieldErrors(error) as Partial<Record<TField, string>>;
      setFieldErrors(errors);
      setFormError(undefined);

      if (fieldOrder?.length) {
        scrollToFirstFieldError(errors, fieldOrder, idPrefix);
        return;
      }

      const firstField = getFirstInvalidField(error) as TField | undefined;

      if (firstField) {
        scrollToFormField(buildFormFieldId(idPrefix, firstField));
      }
    },
    [idPrefix],
  );

  const clearFieldError = useCallback((field: TField) => {
    setFieldErrors((prev) => {
      if (!prev[field]) return prev;

      const next = { ...prev };
      delete next[field];
      return next;
    });
  }, []);

  const clearErrors = useCallback(() => {
    setFieldErrors({});
    setFormError(undefined);
  }, []);

  return {
    fieldErrors,
    formError,
    setFormError,
    applyZodError,
    clearFieldError,
    clearErrors,
  };
}
