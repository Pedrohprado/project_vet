import { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router';
import { toast } from 'sonner';
import { ApiError } from '@/api/http';
import {
  SignaturePadField,
  type SignaturePadFieldHandle,
} from '@/components/profile/signature-pad-field';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { useAuth } from '@/hooks/useAuth';
import { pageShellClassName, pageTitleClassName } from '@/lib/mobile-ui';

export function ProfilePage() {
  const { user, updateProfile, saveSignature } = useAuth();
  const signatureRef = useRef<SignaturePadFieldHandle>(null);
  const [phone, setPhone] = useState(user?.phone ?? '');
  const [crmv, setCrmv] = useState(user?.crmv ?? '');
  const [hasSignatureDraft, setHasSignatureDraft] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (!user) return;
    setPhone(user.phone ?? '');
    setCrmv(user.crmv ?? '');
    setHasSignatureDraft(false);
  }, [user]);

  if (!user) {
    return <p className="text-muted-foreground">Carregando perfil...</p>;
  }

  const normalizedPhone = phone.trim() || null;
  const normalizedCrmv = crmv.trim() || null;
  const hasProfileChanges =
    normalizedPhone !== (user.phone?.trim() || null) ||
    normalizedCrmv !== (user.crmv?.trim() || null);
  const hasSignatureToSave = !user.signatureUrl && hasSignatureDraft;
  const hasChanges = hasProfileChanges || hasSignatureToSave;

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    setIsSaving(true);

    try {
      if (hasProfileChanges) {
        await updateProfile({
          phone: normalizedPhone,
          crmv: normalizedCrmv,
        });
      }

      if (hasSignatureToSave) {
        const signature = signatureRef.current?.getDataUrl();
        if (!signature) {
          toast.error('Desenhe sua assinatura antes de salvar.');
          return;
        }
        await saveSignature(signature);
        signatureRef.current?.clear();
        setHasSignatureDraft(false);
      }

      toast.success('Perfil atualizado!');
    } catch (err) {
      toast.error(err instanceof ApiError ? err.message : 'Erro ao salvar perfil');
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <div className={pageShellClassName}>
      <h1 className={pageTitleClassName}>Meu perfil</h1>

      <Card className="mt-6">
        <CardHeader>
          <CardTitle>Dados profissionais</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={(event) => void handleSubmit(event)} className="space-y-6">
            <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="name">Nome</Label>
                <Input id="name" value={user.name} disabled />
              </div>

              <div className="space-y-2">
                <Label htmlFor="email">E-mail</Label>
                <Input id="email" value={user.email} disabled />
              </div>

              <div className="space-y-2">
                <Label htmlFor="phone">Telefone</Label>
                <Input
                  id="phone"
                  value={phone}
                  onChange={(event) => setPhone(event.target.value)}
                  placeholder="(14) 99680-8476"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="crmv">CRMV</Label>
                <CardDescription>
                  O CRMV é opcional, mas recomendado para receitas impressas.
                </CardDescription>
                <Input
                  id="crmv"
                  value={crmv}
                  onChange={(event) => setCrmv(event.target.value)}
                  placeholder="Ex.: 12345-SP"
                />
              </div>
            </div>

            <Separator />

            <div className="space-y-4">
              <div className="space-y-1">
                <CardTitle>Assinatura eletrônica</CardTitle>
                <CardDescription>
                  Sua assinatura aparecerá no final das receitas veterinárias em PDF.
                </CardDescription>
              </div>
              <SignaturePadField
                ref={signatureRef}
                savedSignatureUrl={user.signatureUrl}
                onSignatureChange={setHasSignatureDraft}
              />
            </div>

            <div className="flex flex-col gap-2 sm:flex-row">
              <Button
                type="submit"
                className="w-full sm:w-auto"
                disabled={isSaving || !hasChanges}
              >
                {isSaving ? 'Salvando...' : 'Salvar alterações'}
              </Button>
              <Button
                type="button"
                variant="outline"
                className="w-full sm:w-auto"
                render={<Link to="/estatisticas" />}
              >
                Voltar
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
