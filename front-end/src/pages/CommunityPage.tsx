import { useEffect, useState } from 'react';
import { Link, useSearchParams } from 'react-router';
import { MessagesSquare, Plus } from 'lucide-react';
import { CommunityCaseCard } from '@/components/community/community-case-card';
import { CommunityCaseDetailDialog } from '@/components/community/community-case-detail-dialog';
import {
  CommunityFilters,
  type CommunityFiltersState,
} from '@/components/community/community-filters';
import { SelectConsultationForShareDialog } from '@/components/community/select-consultation-for-share-dialog';
import { ShareCommunityCaseDialog } from '@/components/community/share-community-case-dialog';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { useCommunityCases } from '@/hooks/useCommunity';
import {
  pageDescriptionClassName,
  pageShellClassName,
  pageTitleClassName,
} from '@/lib/mobile-ui';
import type { CommunityCase } from '@/types/community';
import type { Consultation } from '@/types/consultation';

const EMPTY_FILTERS: CommunityFiltersState = {
  q: '',
  species: '',
  sex: '',
};

export function CommunityPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [page, setPage] = useState(1);
  const [filters, setFilters] = useState<CommunityFiltersState>(EMPTY_FILTERS);
  const [debouncedQ, setDebouncedQ] = useState('');
  const [selectOpen, setSelectOpen] = useState(false);
  const [shareOpen, setShareOpen] = useState(false);
  const [selectedConsultation, setSelectedConsultation] =
    useState<Consultation | null>(null);
  const [detailCase, setDetailCase] = useState<CommunityCase | null>(null);
  const [detailCaseId, setDetailCaseId] = useState<string | null>(null);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      setDebouncedQ(filters.q.trim());
    }, 300);
    return () => window.clearTimeout(timer);
  }, [filters.q]);

  const activeFilters = {
    q: debouncedQ || undefined,
    species: filters.species || undefined,
    sex: filters.sex || undefined,
  };
  const hasActiveFilters = Boolean(
    activeFilters.q || activeFilters.species || activeFilters.sex,
  );

  const { data, isLoading, isError, isFetching } = useCommunityCases(
    page,
    20,
    activeFilters,
  );

  const totalPages = data ? Math.max(1, Math.ceil(data.total / data.limit)) : 1;
  const caseFromQuery = searchParams.get('caso');

  useEffect(() => {
    if (!caseFromQuery) return;
    setDetailCaseId(caseFromQuery);
    const match = data?.items.find((item) => item.id === caseFromQuery) ?? null;
    setDetailCase(match);
  }, [caseFromQuery, data?.items]);

  function handleFiltersChange(next: CommunityFiltersState) {
    setFilters(next);
    setPage(1);
  }

  function openDetail(communityCase: CommunityCase) {
    setDetailCase(communityCase);
    setDetailCaseId(communityCase.id);
  }

  function handleDetailOpenChange(open: boolean) {
    if (open) return;
    setDetailCase(null);
    setDetailCaseId(null);
    if (searchParams.has('caso')) {
      const next = new URLSearchParams(searchParams);
      next.delete('caso');
      setSearchParams(next, { replace: true });
    }
  }

  function handleSelectConsultation(consultation: Consultation) {
    setSelectedConsultation(consultation);
    setShareOpen(true);
  }

  function handleShareOpenChange(open: boolean) {
    setShareOpen(open);
    if (!open) {
      setSelectedConsultation(null);
    }
  }

  function handlePublished(communityCase: CommunityCase) {
    openDetail(communityCase);
  }

  return (
    <div className={pageShellClassName}>
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className={pageTitleClassName}>Comunidade</h1>
          <p className={pageDescriptionClassName}>
            Casos clínicos compartilhados por veterinários da plataforma.
          </p>
        </div>
        <Button
          type="button"
          className="w-full sm:w-auto"
          onClick={() => setSelectOpen(true)}
        >
          <Plus className="size-4" />
          Compartilhar caso
        </Button>
      </div>

      <CommunityFilters filters={filters} onChange={handleFiltersChange} />

      {isLoading ? (
        <div className="space-y-3">
          <Skeleton className="h-36 w-full" />
          <Skeleton className="h-36 w-full" />
          <Skeleton className="h-36 w-full" />
        </div>
      ) : isError ? (
        <p className="text-sm text-destructive">
          Não foi possível carregar a comunidade. Tente novamente.
        </p>
      ) : !data?.items.length ? (
        <div className="flex flex-col items-center justify-center gap-3 rounded-lg border border-dashed px-6 py-16 text-center">
          <MessagesSquare className="size-10 text-muted-foreground" />
          <div className="space-y-1">
            <p className="font-medium">
              {hasActiveFilters
                ? 'Nenhuma publicação encontrada'
                : 'Nenhum caso compartilhado ainda'}
            </p>
            <p className="text-sm text-muted-foreground">
              {hasActiveFilters
                ? 'Tente ajustar os filtros ou limpar a busca.'
                : 'Compartilhe uma consulta finalizada para publicar o primeiro caso na comunidade.'}
            </p>
          </div>
          {hasActiveFilters ? (
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                setFilters(EMPTY_FILTERS);
                setDebouncedQ('');
                setPage(1);
              }}
            >
              Limpar filtros
            </Button>
          ) : (
            <div className="flex flex-col gap-2 sm:flex-row">
              <Button type="button" onClick={() => setSelectOpen(true)}>
                <Plus className="size-4" />
                Compartilhar caso
              </Button>
              <Button variant="outline" render={<Link to="/atendimento" />}>
                Ir para atendimentos
              </Button>
            </div>
          )}
        </div>
      ) : (
        <>
          <div
            className={`divide-y divide-border ${isFetching ? 'opacity-70' : ''}`}
          >
            {data.items.map((communityCase) => (
              <CommunityCaseCard
                key={communityCase.id}
                communityCase={communityCase}
                onOpenDetail={openDetail}
              />
            ))}
          </div>

          {totalPages > 1 ? (
            <div className="flex items-center justify-center gap-2">
              <Button
                type="button"
                variant="outline"
                disabled={page <= 1}
                onClick={() => setPage((current) => Math.max(1, current - 1))}
              >
                Anterior
              </Button>
              <span className="text-sm text-muted-foreground">
                Página {page} de {totalPages}
              </span>
              <Button
                type="button"
                variant="outline"
                disabled={page >= totalPages}
                onClick={() =>
                  setPage((current) => Math.min(totalPages, current + 1))
                }
              >
                Próxima
              </Button>
            </div>
          ) : null}
        </>
      )}

      <SelectConsultationForShareDialog
        open={selectOpen}
        onOpenChange={setSelectOpen}
        onSelect={handleSelectConsultation}
      />

      {selectedConsultation ? (
        <ShareCommunityCaseDialog
          open={shareOpen}
          onOpenChange={handleShareOpenChange}
          consultation={selectedConsultation}
          onPublished={handlePublished}
        />
      ) : null}

      <CommunityCaseDetailDialog
        open={Boolean(detailCaseId)}
        onOpenChange={handleDetailOpenChange}
        caseId={detailCaseId}
        initialCase={detailCase}
      />
    </div>
  );
}
