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
      <div className="space-y-3">
        <div className="flex max-w-md items-center justify-center rounded-lg border bg-muted/30 px-4 py-3">
          {safeSignatureUrl ? (
            <img
              src={safeSignatureUrl}
              alt="Assinatura salva"
              className="h-20 w-full max-w-sm object-contain object-center"
            />
          ) : (
            <p className="text-sm text-muted-foreground">Assinatura indisponível</p>
          )}
        </div>
        <p className="text-xs text-muted-foreground">
          Remova a assinatura atual para cadastrar uma nova.
        </p>
        <Button
          type="button"
          variant="outline"
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
    <div className="space-y-3">
      <div className="max-w-md overflow-hidden rounded-lg border border-dashed bg-white">
        <canvas ref={canvasRef} className="h-28 w-full touch-none sm:h-32" />
      </div>
      <p className="text-xs text-muted-foreground">
        Use o mouse ou o dedo para assinar no campo acima.
      </p>
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
