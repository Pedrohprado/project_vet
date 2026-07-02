import { useEffect, useRef, useState } from 'react';
import SignaturePad from 'signature_pad';
import { toast } from 'sonner';
import { ApiError } from '@/api/http';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/hooks/useAuth';

type SignaturePadFieldProps = {
  savedSignatureUrl: string | null;
};

export function SignaturePadField({ savedSignatureUrl }: SignaturePadFieldProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const padRef = useRef<SignaturePad | null>(null);
  const { saveSignature, deleteSignature } = useAuth();
  const [isSaving, setIsSaving] = useState(false);
  const [isRemoving, setIsRemoving] = useState(false);

  useEffect(() => {
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
    };

    padRef.current = new SignaturePad(canvas, {
      backgroundColor: 'rgb(255, 255, 255)',
      penColor: 'rgb(17, 24, 39)',
    });

    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);

    return () => {
      window.removeEventListener('resize', resizeCanvas);
      padRef.current?.off();
      padRef.current = null;
    };
  }, []);

  function handleClear() {
    padRef.current?.clear();
  }

  async function handleSave() {
    const pad = padRef.current;

    if (!pad || pad.isEmpty()) {
      toast.error('Desenhe sua assinatura antes de salvar.');
      return;
    }

    setIsSaving(true);

    try {
      await saveSignature(pad.toDataURL('image/png'));
      pad.clear();
      toast.success('Assinatura salva!');
    } catch (err) {
      toast.error(err instanceof ApiError ? err.message : 'Erro ao salvar assinatura');
    } finally {
      setIsSaving(false);
    }
  }

  async function handleRemove() {
    setIsRemoving(true);

    try {
      await deleteSignature();
      padRef.current?.clear();
      toast.success('Assinatura removida.');
    } catch (err) {
      toast.error(err instanceof ApiError ? err.message : 'Erro ao remover assinatura');
    } finally {
      setIsRemoving(false);
    }
  }

  return (
    <div className="space-y-4">
      {savedSignatureUrl ? (
        <div className="space-y-2">
          <p className="text-sm font-medium">Assinatura salva</p>
          <div className="rounded-lg border bg-white p-3">
            <img
              src={savedSignatureUrl}
              alt="Assinatura salva"
              className="mx-auto h-16 max-w-full object-contain"
            />
          </div>
        </div>
      ) : null}

      <div className="space-y-2">
        <p className="text-sm font-medium">
          {savedSignatureUrl ? 'Desenhar nova assinatura' : 'Desenhe sua assinatura'}
        </p>
        <div className="overflow-hidden rounded-lg border border-dashed bg-white">
          <canvas ref={canvasRef} className="h-40 w-full touch-none" />
        </div>
        <p className="text-xs text-muted-foreground">
          Use o mouse ou o dedo para assinar no campo acima.
        </p>
      </div>

      <div className="flex flex-col gap-2 sm:flex-row sm:flex-wrap">
        <Button type="button" variant="outline" onClick={handleClear}>
          Limpar
        </Button>
        <Button type="button" onClick={() => void handleSave()} disabled={isSaving}>
          {isSaving ? 'Salvando...' : 'Salvar assinatura'}
        </Button>
        {savedSignatureUrl ? (
          <Button
            type="button"
            variant="destructive"
            onClick={() => void handleRemove()}
            disabled={isRemoving}
          >
            {isRemoving ? 'Removendo...' : 'Remover assinatura'}
          </Button>
        ) : null}
      </div>
    </div>
  );
}
