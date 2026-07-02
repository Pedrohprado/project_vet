import { useEffect, useState } from 'react';
import { EllipsisVertical, Search } from 'lucide-react';
import { toast } from 'sonner';
import { ApiError } from '@/api/http';
import type { PlatformClinic } from '@/api/platform';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Skeleton } from '@/components/ui/skeleton';
import { usePlatformClinics, useUpdateClinicStatus } from '@/hooks/usePlatform';
import {
  pageDescriptionClassName,
  pageShellClassName,
  pageTitleClassName,
} from '@/lib/mobile-ui';

function formatDate(value: string) {
  return new Date(value).toLocaleDateString('pt-BR');
}

function planLabel(plan: PlatformClinic['plan']) {
  const labels = {
    FREE: 'Gratuito',
    STARTER: 'Starter',
    PRO: 'Pro',
  } as const;

  return labels[plan];
}

function ClinicRow({
  clinic,
  onToggleStatus,
}: {
  clinic: PlatformClinic;
  onToggleStatus: (clinic: PlatformClinic) => void;
}) {
  return (
    <tr className="border-b transition-colors last:border-0 hover:bg-muted/50">
      <td className="px-4 py-3 text-sm font-medium">{clinic.name}</td>
      <td className="px-4 py-3 text-sm text-muted-foreground">
        {clinic.email ?? clinic.phone ?? '—'}
      </td>
      <td className="px-4 py-3">
        <Badge variant="outline">{planLabel(clinic.plan)}</Badge>
      </td>
      <td className="px-4 py-3 text-sm text-muted-foreground">{clinic.tutorsCount}</td>
      <td className="px-4 py-3 text-sm text-muted-foreground">{clinic.petsCount}</td>
      <td className="px-4 py-3">
        <Badge variant={clinic.isActive ? 'default' : 'secondary'}>
          {clinic.isActive ? 'Ativa' : 'Inativa'}
        </Badge>
      </td>
      <td className="px-4 py-3 text-sm text-muted-foreground whitespace-nowrap">
        {formatDate(clinic.createdAt)}
      </td>
      <td className="px-4 py-3 text-right">
        <DropdownMenu>
          <DropdownMenuTrigger
            render={
              <Button variant="ghost" size="icon-sm" aria-label="Ações da clínica" />
            }
          >
            <EllipsisVertical className="size-4" />
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem
              variant={clinic.isActive ? 'destructive' : 'default'}
              onClick={() => onToggleStatus(clinic)}
            >
              {clinic.isActive ? 'Desativar clínica' : 'Reativar clínica'}
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </td>
    </tr>
  );
}

export function AdminClinicsPage() {
  const [search, setSearch] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [status, setStatus] = useState<'all' | 'active' | 'inactive'>('all');
  const [clinicToToggle, setClinicToToggle] = useState<PlatformClinic | null>(null);
  const { data, isLoading, error } = usePlatformClinics(
    debouncedSearch || undefined,
    status,
    { limit: 50 },
  );
  const updateStatus = useUpdateClinicStatus();

  useEffect(() => {
    const timer = window.setTimeout(() => {
      setDebouncedSearch(search);
    }, 300);

    return () => window.clearTimeout(timer);
  }, [search]);

  async function handleConfirmToggle() {
    if (!clinicToToggle) return;

    try {
      await updateStatus.mutateAsync({
        id: clinicToToggle.id,
        isActive: !clinicToToggle.isActive,
      });
      toast.success(
        clinicToToggle.isActive
          ? 'Clínica desativada com sucesso.'
          : 'Clínica reativada com sucesso.',
      );
      setClinicToToggle(null);
    } catch (err) {
      const message =
        err instanceof ApiError ? err.message : 'Erro ao atualizar status da clínica';
      toast.error(message);
    }
  }

  return (
    <div className={pageShellClassName}>
      <div>
        <h1 className={pageTitleClassName}>Clínicas</h1>
        <p className={pageDescriptionClassName}>
          Clientes cadastrados na plataforma. Desative clínicas para bloquear o acesso.
        </p>
      </div>

      <Card>
        <CardHeader className="space-y-4">
          <CardTitle>Clínicas cadastradas</CardTitle>
          <div className="flex flex-col gap-3 sm:flex-row">
            <div className="relative flex-1">
              <Search className="absolute top-1/2 left-2.5 size-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Buscar por nome, e-mail ou documento..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-8"
              />
            </div>
            <Select
              items={[
                { value: 'all', label: 'Todas' },
                { value: 'active', label: 'Ativas' },
                { value: 'inactive', label: 'Inativas' },
              ]}
              value={status}
              onValueChange={(value) =>
                setStatus(value as 'all' | 'active' | 'inactive')
              }
            >
              <SelectTrigger className="w-full sm:w-44">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todas</SelectItem>
                <SelectItem value="active">Ativas</SelectItem>
                <SelectItem value="inactive">Inativas</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardHeader>
        <CardContent className="p-0 sm:px-6">
          {isLoading && (
            <div className="space-y-2 px-4 py-6 sm:px-0">
              <Skeleton className="h-10 w-full" />
              <Skeleton className="h-10 w-full" />
              <Skeleton className="h-10 w-full" />
            </div>
          )}

          {error && (
            <p className="px-4 py-8 text-sm text-destructive sm:px-0">
              Não foi possível carregar as clínicas.
            </p>
          )}

          {!isLoading && !error && data?.items.length === 0 && (
            <p className="px-4 py-8 text-center text-sm text-muted-foreground sm:px-0">
              {debouncedSearch
                ? `Nenhuma clínica encontrada para "${debouncedSearch}".`
                : 'Nenhuma clínica cadastrada ainda.'}
            </p>
          )}

          {!isLoading && !error && data && data.items.length > 0 && (
            <div className="overflow-x-auto">
              <table className="w-full min-w-[760px] text-left">
                <thead>
                  <tr className="border-b text-sm text-muted-foreground">
                    <th className="px-4 py-3 font-medium">Nome</th>
                    <th className="px-4 py-3 font-medium">Contato</th>
                    <th className="px-4 py-3 font-medium">Plano</th>
                    <th className="px-4 py-3 font-medium">Tutores</th>
                    <th className="px-4 py-3 font-medium">Pets</th>
                    <th className="px-4 py-3 font-medium">Status</th>
                    <th className="px-4 py-3 font-medium">Cadastro</th>
                    <th className="px-4 py-3 font-medium text-right">Ações</th>
                  </tr>
                </thead>
                <tbody>
                  {data.items.map((clinic) => (
                    <ClinicRow
                      key={clinic.id}
                      clinic={clinic}
                      onToggleStatus={setClinicToToggle}
                    />
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>

      <Dialog
        open={clinicToToggle !== null}
        onOpenChange={(open) => {
          if (!open) setClinicToToggle(null);
        }}
      >
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>
              {clinicToToggle?.isActive ? 'Desativar clínica?' : 'Reativar clínica?'}
            </DialogTitle>
            <DialogDescription>
              {clinicToToggle?.isActive ? (
                <>
                  A clínica <strong>{clinicToToggle?.name}</strong> perderá acesso à
                  plataforma. Os dados serão mantidos e o acesso pode ser restaurado depois.
                </>
              ) : (
                <>
                  A clínica <strong>{clinicToToggle?.name}</strong> voltará a ter acesso à
                  plataforma.
                </>
              )}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="gap-2 sm:gap-0">
            <Button
              type="button"
              variant="outline"
              onClick={() => setClinicToToggle(null)}
              disabled={updateStatus.isPending}
            >
              Cancelar
            </Button>
            <Button
              type="button"
              variant={clinicToToggle?.isActive ? 'destructive' : 'default'}
              onClick={() => void handleConfirmToggle()}
              disabled={updateStatus.isPending}
            >
              {updateStatus.isPending
                ? 'Salvando...'
                : clinicToToggle?.isActive
                  ? 'Desativar'
                  : 'Reativar'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
