import { useCallback, useLayoutEffect, useRef } from 'react';

const LAYER_CLASS =
  'fixed top-0 left-0 z-50 m-0 h-dvh min-h-dvh w-[calc(100vw+(100vw-100%))] min-w-screen max-h-none max-w-none border-0 bg-transparent p-0';

function openLayer(layer: HTMLDivElement) {
  if (typeof layer.showPopover !== 'function') return;
  if (layer.matches(':popover-open')) return;
  try {
    layer.showPopover();
  } catch {
    /* already open or not connected */
  }
}

function closeLayer(layer: HTMLDivElement) {
  if (typeof layer.hidePopover !== 'function') return;
  if (!layer.matches(':popover-open')) return;
  try {
    layer.hidePopover();
  } catch {
    /* already closed */
  }
}

export function useModalLayer() {
  const layerRef = useRef<HTMLDivElement | null>(null);

  const setLayerRef = useCallback((node: HTMLDivElement | null) => {
    if (layerRef.current && layerRef.current !== node) {
      closeLayer(layerRef.current);
    }

    layerRef.current = node;

    if (node) {
      openLayer(node);
    }
  }, []);

  useLayoutEffect(() => {
    const layer = layerRef.current;
    if (layer) openLayer(layer);

    return () => {
      if (layerRef.current) closeLayer(layerRef.current);
    };
  }, []);

  return { layerRef: setLayerRef, layerClassName: LAYER_CLASS };
}
