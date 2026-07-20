import {
  forwardRef,
  useCallback,
  useEffect,
  useImperativeHandle,
  useRef,
  useState,
} from 'react';
import SignaturePad from 'signature_pad';
import { toast } from 'sonner';
import { ApiError } from '@/api/http';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/hooks/useAuth';
import { getSafeMediaUrl } from '@/lib/safe-url';

type SignaturePadFieldProps = {
  savedSignatureUrl: string | null;
  onSignatureChange?: (hasContent: boolean) => void;
};

export type SignaturePadFieldHandle = {
  isEmpty: () => boolean;
  getDataUrl: () => string | null;
  clear: () => void;
};

export const SignaturePadField = forwardRef<
  SignaturePadFieldHandle,
  SignaturePadFieldProps
>(function SignaturePadField(
  { savedSignatureUrl, onSignatureChange },
  ref,
) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const padRef = useRef<SignaturePad | null>(null);
  const { deleteSignature } = useAuth();
  const [isRemoving, setIsRemoving] = useState(false);

  const notifyChange = useCallback(() => {
    onSignatureChange?.(!(padRef.current?.isEmpty() ?? true));
  }, [onSignatureChange]);

  useImperativeHandle(ref, () => ({
    isEmpty: () => padRef.current?.isEmpty() ?? true,
    getDataUrl: () => {
      const pad = padRef.current;
      if (!pad || pad.isEmpty()) return null;
      return pad.toDataURL('image/png');
    },
    clear: () => {
      padRef.current?.clear();
      notifyChange();
    },
  }), [notifyChange]);

  useEffect(() => {
    if (savedSignatureUrl) return;

    const canvas = canvasRef.current;
    if (!canvas) return;

    const resizeCanvas = () => {
      const ratio = Math.max(window.devicePixelRatio || 1, 1);
      const width = canvas.offsetWidth;
      const height = canvas.offsetHeight;

      canvas.width = width * ratio;
      canvas.height = height * ratio;

      const context = canvas.getContext('2d');
      if (context) {
        context.scale(ratio, ratio);
      }

      padRef.current?.clear();
      notifyChange();
    };

    const pad = new SignaturePad(canvas, {
      backgroundColor: 'rgb(255, 255, 255)',
      penColor: 'rgb(17, 24, 39)',
    });

    pad.addEventListener('endStroke', notifyChange);
    padRef.current = pad;

    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);

    return () => {
      window.removeEventListener('resize', resizeCanvas);
      pad.removeEventListener('endStroke', notifyChange);
      pad.off();
      padRef.current = null;
      notifyChange();
    };
  }, [savedSignatureUrl, notifyChange]);

  function handleClear() {
    padRef.current?.clear();
    notifyChange();
  }

  async function handleRemove() {
    setIsRemoving(true);

    try {
      await deleteSignature();
      padRef.current?.clear();
      onSignatureChange?.(false);
      toast.success('Assinatura removida.');
    } catch (err) {
      toast.error(err instanceof ApiError ? err.message : 'Erro ao remover assinatura');
    } finally {
      setIsRemoving(false);
    }
  }

  if (savedSignatureUrl) {
    const safeSignatureUrl = getSafeMediaUrl(savedSignatureUrl);

    return (
      <div className="space-y-4">
        <div className="space-y-2">
          <p className="text-sm font-medium">Assinatura salva</p>
          <div className="rounded-lg border bg-white p-3">
            {safeSignatureUrl ? (
              <img
                src={safeSignatureUrl}
                alt="Assinatura salva"
                className="mx-auto h-16 max-w-full object-contain"
              />
            ) : (
              <p className="text-center text-sm text-muted-foreground">
                Assinatura indisponível
              </p>
            )}
          </div>
          <p className="text-xs text-muted-foreground">
            Remova a assinatura atual para cadastrar uma nova.
          </p>
        </div>
        <Button
          type="button"
          variant="destructive"
          className="w-full sm:w-auto"
          onClick={() => void handleRemove()}
          disabled={isRemoving}
        >
          {isRemoving ? 'Removendo...' : 'Remover assinatura'}
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <p className="text-sm font-medium">Desenhe sua assinatura</p>
        <div className="overflow-hidden rounded-lg border border-dashed bg-white">
          <canvas ref={canvasRef} className="h-40 w-full touch-none" />
        </div>
        <p className="text-xs text-muted-foreground">
          Use o mouse ou o dedo para assinar no campo acima.
        </p>
      </div>

      <Button
        type="button"
        variant="outline"
        className="w-full sm:w-auto"
        onClick={handleClear}
      >
        Limpar
      </Button>
    </div>
  );
});
