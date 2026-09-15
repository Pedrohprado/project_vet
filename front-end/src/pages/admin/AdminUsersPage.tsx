import { useEffect, useState } from 'react';
import { QrCode, Search } from 'lucide-react';
import { toast } from 'sonner';
import { ApiError } from '@/api/http';
import type { PlatformVeterinarian } from '@/api/platform';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet';
import { Skeleton } from '@/components/ui/skeleton';
import {
  usePlatformVeterinarians,
  useUpdatePlatformClinic,
} from '@/hooks/usePlatform';
import {
  pageDescriptionClassName,
  pageShellClassName,
  pageTitleClassName,
} from '@/lib/mobile-ui';
import type { PaymentMethod, PaymentStatus } from '@/types/auth';

function formatDateTime(value: string | null) {
  if (!value) return '—';
  return new Date(value).toLocaleString('pt-BR');
}

function planLabel(plan: PlatformVeterinarian['clinicPlan']) {
  if (!plan) return '—';
  const labels = {
    FREE: 'Gratuito',
    STARTER: 'Starter',
    PRO: 'Pro',
  } as const;
  return labels[plan];
}

function methodLabel(method: PaymentMethod | null) {
  if (!method) return '—';
  const labels = {
    NONE: 'Nenhum',
    PIX: 'Pix',
    CARD: 'Cartão',
  } as const;
  return labels[method];
}

function statusLabel(status: PaymentStatus | null) {
  if (!status) return '—';
  return status === 'PAID' ? 'Pago' : 'Pendente';
}

export function AdminUsersPage() {
  const [search, setSearch] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [selected, setSelected] = useState<PlatformVeterinarian | null>(null);
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('NONE');
  const [paymentStatus, setPaymentStatus] = useState<PaymentStatus>('PENDING');

  useEffect(() => {
    const timer = window.setTimeout(() => setDebouncedSearch(search.trim()), 300);
    return () => window.clearTimeout(timer);
  }, [search]);

  const { data, isLoading, isError } = usePlatformVeterinarians(
    debouncedSearch || undefined,
    { page: 1, limit: 50 },
  );
  const updateClinic = useUpdatePlatformClinic();

  const items = data?.items ?? [];

  function openUser(user: PlatformVeterinarian) {
    setSelected(user);
    setPaymentMethod(user.paymentMethod ?? 'NONE');
    setPaymentStatus(user.paymentStatus ?? 'PENDING');
  }

  async function handleSaveBilling() {
    if (!selected?.clinicId) {
      toast.error('Usuário sem clínica associada.');
      return;
    }

    try {
      await updateClinic.mutateAsync({
        id: selected.clinicId,
        payload: { paymentMethod, paymentStatus },
      });
      toast.success('Billing atualizado.');
      setSelected((current) =>
        current
          ? {
              ...current,
              paymentMethod,
              paymentStatus,
            }
          : current,
      );
    } catch (error) {
      const message =
        error instanceof ApiError
          ? error.message
          : 'Não foi possível atualizar o billing.';
      toast.error(message);
    }
  }

  return (
    <div className={pageShellClassName}>
      <div>
        <h1 className={pageTitleClassName}>Usuários</h1>
        <p className={pageDescriptionClassName}>
          Cadastros da plataforma, método de pagamento e status.
        </p>
      </div>

      <Card>
        <CardHeader className="gap-4 sm:flex-row sm:items-center sm:justify-between">
          <CardTitle>Registrados</CardTitle>
          <div className="relative w-full sm:max-w-xs">
            <Search className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Buscar nome, e-mail ou clínica"
              className="pl-9"
            />
          </div>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="space-y-2">
              <Skeleton className="h-10 w-full" />
              <Skeleton className="h-10 w-full" />
              <Skeleton className="h-10 w-full" />
            </div>
          ) : isError ? (
            <p className="text-sm text-destructive">
              Não foi possível carregar os usuários.
            </p>
          ) : items.length === 0 ? (
            <p className="text-sm text-muted-foreground">
              Nenhum usuário encontrado.
            </p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full min-w-[860px] text-left text-sm">
                <thead>
                  <tr className="border-b border-border/60 text-muted-foreground">
                    <th className="pb-2 pr-4 font-medium">Nome</th>
                    <th className="pb-2 pr-4 font-medium">E-mail</th>
                    <th className="pb-2 pr-4 font-medium">Clínica</th>
                    <th className="pb-2 pr-4 font-medium">Plano</th>
                    <th className="pb-2 pr-4 font-medium">Método</th>
                    <th className="pb-2 pr-4 font-medium">Status</th>
                    <th className="pb-2 font-medium">Último login</th>
                  </tr>
                </thead>
                <tbody>
                  {items.map((user) => (
                    <tr
                      key={user.id}
                      className="cursor-pointer border-b border-border/40 transition-colors hover:bg-muted/40"
                      onClick={() => openUser(user)}
                    >
                      <td className="py-2.5 pr-4 font-medium">{user.name}</td>
                      <td className="py-2.5 pr-4 text-muted-foreground">
                        {user.email}
                      </td>
                      <td className="py-2.5 pr-4 text-muted-foreground">
                        {user.clinicName ?? '—'}
                      </td>
                      <td className="py-2.5 pr-4">
                        <Badge variant="outline">{planLabel(user.clinicPlan)}</Badge>
                      </td>
                      <td className="py-2.5 pr-4">
                        {methodLabel(user.paymentMethod)}
                      </td>
                      <td className="py-2.5 pr-4">
                        <Badge
                          variant={
                            user.paymentStatus === 'PAID' ? 'default' : 'secondary'
                          }
                        >
                          {statusLabel(user.paymentStatus)}
                        </Badge>
                      </td>
                      <td className="py-2.5 text-muted-foreground whitespace-nowrap">
                        {formatDateTime(user.lastLoginAt)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>

      <Sheet
        open={selected !== null}
        onOpenChange={(open) => {
          if (!open) setSelected(null);
        }}
      >
        <SheetContent className="w-full sm:max-w-md">
          {selected ? (
            <>
              <SheetHeader>
                <SheetTitle>{selected.name}</SheetTitle>
                <SheetDescription>
                  {selected.email}
                  {selected.clinicName ? ` · ${selected.clinicName}` : ''}
                </SheetDescription>
              </SheetHeader>

              <div className="flex flex-1 flex-col gap-5 px-4">
                <div className="grid gap-1 text-sm">
                  <p>
                    <span className="text-muted-foreground">Plano: </span>
                    {planLabel(selected.clinicPlan)}
                  </p>
                  <p>
                    <span className="text-muted-foreground">Último login: </span>
                    {formatDateTime(selected.lastLoginAt)}
                  </p>
                  <p>
                    <span className="text-muted-foreground">CRMV: </span>
                    {selected.crmv ?? '—'}
                  </p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="payment-method">Método de pagamento</Label>
                  <Select
                    items={[
                      { value: 'NONE', label: 'Nenhum' },
                      { value: 'PIX', label: 'Pix' },
                      { value: 'CARD', label: 'Cartão' },
                    ]}
                    value={paymentMethod}
                    onValueChange={(value) =>
                      setPaymentMethod(value as PaymentMethod)
                    }
                  >
                    <SelectTrigger id="payment-method" className="w-full">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="NONE">Nenhum</SelectItem>
                      <SelectItem value="PIX">Pix</SelectItem>
                      <SelectItem value="CARD">Cartão</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="payment-status">Status do pagamento</Label>
                  <Select
                    items={[
                      { value: 'PENDING', label: 'Pendente' },
                      { value: 'PAID', label: 'Pago' },
                    ]}
                    value={paymentStatus}
                    onValueChange={(value) =>
                      setPaymentStatus(value as PaymentStatus)
                    }
                  >
                    <SelectTrigger id="payment-status" className="w-full">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="PENDING">Pendente</SelectItem>
                      <SelectItem value="PAID">Pago</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="rounded-xl border border-dashed border-border/70 bg-muted/30 p-4">
                  <div className="flex items-start gap-3">
                    <div className="flex size-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
                      <QrCode className="size-5" />
                    </div>
                    <div className="space-y-1">
                      <p className="text-sm font-medium">Gerar Pix / QR</p>
                      <p className="text-xs leading-relaxed text-muted-foreground">
                        Em breve você poderá gerar um QR Code e o Pix copia e cola
                        para enviar ao usuário.
                      </p>
                    </div>
                  </div>
                  <Button className="mt-3 w-full" disabled>
                    Gerar Pix / QR (em breve)
                  </Button>
                </div>
              </div>

              <SheetFooter>
                <Button
                  onClick={() => void handleSaveBilling()}
                  disabled={updateClinic.isPending || !selected.clinicId}
                >
                  {updateClinic.isPending ? 'Salvando...' : 'Salvar billing'}
                </Button>
              </SheetFooter>
            </>
          ) : null}
        </SheetContent>
      </Sheet>
    </div>
  );
}
