import { useEffect, useRef } from 'react';
import {
  writeConsultationDraft,
  type ConsultationDraft,
} from '@/lib/consultation-draft';

const DEBOUNCE_MS = 350;

type UseConsultationDraftOptions = {
  consultationId: string | undefined;
  enabled: boolean;
  draft: ConsultationDraft;
};

export function useConsultationDraft({
  consultationId,
  enabled,
  draft,
}: UseConsultationDraftOptions) {
  const draftRef = useRef(draft);
  draftRef.current = draft;

  const consultationIdRef = useRef(consultationId);
  consultationIdRef.current = consultationId;

  const enabledRef = useRef(enabled);
  enabledRef.current = enabled;

  useEffect(() => {
    if (!enabled || !consultationId) return;

    const timer = window.setTimeout(() => {
      writeConsultationDraft(consultationId, draft);
    }, DEBOUNCE_MS);

    return () => window.clearTimeout(timer);
  }, [consultationId, enabled, draft]);

  useEffect(() => {
    function flush() {
      const id = consultationIdRef.current;
      if (!enabledRef.current || !id) return;
      writeConsultationDraft(id, draftRef.current);
    }

    window.addEventListener('pagehide', flush);
    window.addEventListener('beforeunload', flush);

    return () => {
      window.removeEventListener('pagehide', flush);
      window.removeEventListener('beforeunload', flush);
    };
  }, []);
}
