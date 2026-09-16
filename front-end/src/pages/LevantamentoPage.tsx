import { useEffect, useState } from 'react';
import { Link } from 'react-router';
import { getPublicStats, type PublicStats } from '@/api/public-stats';
import { BrandCardBirds } from '@/components/brand/brand-card-birds';
import { BrandLogo } from '@/components/brand/brand-logo';
import { BrandPageBackground } from '@/components/brand-page-background';
import { useDocumentSeo } from '@/hooks/use-document-seo';
import {
  marketingBodyClassName,
  marketingCardClassName,
  marketingTitleClassName,
} from '@/lib/landing-styles';
import { levantamentoSeo } from '@/lib/seo';
import { cn } from '@/lib/utils';

const METRICS: {
  key: keyof PublicStats;
  label: string;
  description: string;
}[] = [
  {
    key: 'registeredUsers',
    label: 'Registrados',
    description: 'Usuários com clínica na plataforma',
  },
  {
    key: 'entrada',
    label: 'Entrada',
    description: 'Acessos à splash, login e cadastro',
  },
  {
    key: 'checkout',
    label: 'Checkout',
    description: 'Chegaram na assinatura ou pagamento',
  },
  {
    key: 'entered',
    label: 'Entraram',
    description: 'Entraram de fato no aplicativo',
  },
];

function formatMetric(value: number | null | undefined) {
  if (value == null) return '—';
  return value.toLocaleString('pt-BR');
}

export function LevantamentoPage() {
  useDocumentSeo(levantamentoSeo);
  const [stats, setStats] = useState<PublicStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);

  useEffect(() => {
    let cancelled = false;

    void (async () => {
      try {
        const data = await getPublicStats();
        if (!cancelled) {
          setStats(data);
          setHasError(false);
        }
      } catch {
        if (!cancelled) {
          setStats(null);
          setHasError(true);
        }
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <div className="relative flex min-h-svh items-center justify-center overflow-hidden bg-white px-4 py-10 sm:px-6 sm:py-12">
      <BrandPageBackground variant="absolute" blurHeight="55%" />

      <div className="relative z-10 w-full max-w-3xl">
        <div className="relative">
          <BrandCardBirds count={3} />

          <div className={cn(marketingCardClassName, 'overflow-visible')}>
            <div className="flex flex-col items-center text-center">
              <BrandLogo size="lg" />
              <h1 className={cn(marketingTitleClassName, 'mt-5')}>
                Levantamento
              </h1>
              <p className={cn(marketingBodyClassName, 'mt-2 max-w-md')}>
                Números públicos do funil de acesso da plataforma.
              </p>
            </div>

            <div className="mt-8 grid gap-4 sm:grid-cols-2">
              {METRICS.map((metric) => (
                <div
                  key={metric.key}
                  className="rounded-xl border border-border/50 bg-white/80 px-5 py-4 text-left"
                >
                  <p className="text-sm font-medium text-foreground/70">
                    {metric.label}
                  </p>
                  <p className="mt-1 text-3xl font-bold tracking-tight text-foreground tabular-nums">
                    {isLoading
                      ? '…'
                      : formatMetric(hasError ? null : stats?.[metric.key])}
                  </p>
                  <p className="mt-1 text-xs leading-relaxed text-foreground/55">
                    {metric.description}
                  </p>
                </div>
              ))}
            </div>

            {hasError ? (
              <p className="mt-6 text-center text-sm text-destructive">
                Não foi possível carregar as métricas agora.
              </p>
            ) : null}

            <div className="mt-8 flex justify-center">
              <Link
                to="/"
                className="text-sm font-medium text-primary underline-offset-4 hover:underline"
              >
                Voltar ao início
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
