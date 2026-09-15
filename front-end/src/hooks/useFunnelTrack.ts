import { useEffect } from 'react';
import { useLocation } from 'react-router';
import {
  trackFunnelEvent,
  type FunnelStep,
  type TrackFunnelEventPayload,
} from '@/api/public-stats';

const SESSION_ID_KEY = 'boxvet:funnel-session-id';
const TRACKED_PREFIX = 'boxvet:funnel-tracked:';

function getOrCreateSessionId() {
  try {
    const existing = sessionStorage.getItem(SESSION_ID_KEY);
    if (existing) return existing;

    const nextId =
      typeof crypto !== 'undefined' && 'randomUUID' in crypto
        ? crypto.randomUUID()
        : `sess-${Date.now()}-${Math.random().toString(36).slice(2)}`;

    sessionStorage.setItem(SESSION_ID_KEY, nextId);
    return nextId;
  } catch {
    return undefined;
  }
}

function wasTracked(path: string) {
  try {
    return sessionStorage.getItem(`${TRACKED_PREFIX}${path}`) === '1';
  } catch {
    return false;
  }
}

function markTracked(path: string) {
  try {
    sessionStorage.setItem(`${TRACKED_PREFIX}${path}`, '1');
  } catch {
    // ignore storage failures
  }
}

export function useFunnelTrack(step: FunnelStep) {
  const location = useLocation();
  const path = location.pathname as TrackFunnelEventPayload['path'];

  useEffect(() => {
    if (wasTracked(path)) return;

    markTracked(path);

    const sessionId = getOrCreateSessionId();

    void trackFunnelEvent({
      step,
      path,
      ...(sessionId ? { sessionId } : {}),
    }).catch(() => {
      // tracking must never break UX
    });
  }, [path, step]);
}
