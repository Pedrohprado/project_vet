import { Link, Navigate } from 'react-router';
import { CreditCard, QrCode } from 'lucide-react';
import { BrandCardBirds } from '@/components/brand/brand-card-birds';
import { BrandLogo } from '@/components/brand/brand-logo';
import { BrandPageBackground } from '@/components/brand-page-background';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/hooks/useAuth';
import {
  firstName,
  getPostAuthPath,
  hasAppAccess,
  SUBSCRIPTION_PRICE,
  subscriptionBenefits,
} from '@/lib/billing';
import {
  landingPrimaryButtonClassName,
  marketingBodyClassName,
  marketingCardClassName,
  marketingListItemClassName,
  marketingTitleClassName,
} from '@/lib/landing-styles';

export function SubscriptionIntroPage() {
  const { user, clinic, isLoading, isAuthenticated } = useAuth();

  if (isLoading) {
    return (
      <div className="flex min-h-svh items-center justify-center text-muted-foreground">
        Carregando...
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (hasAppAccess(user, clinic)) {
    return <Navigate to={getPostAuthPath(user, clinic)} replace />;
  }

  const name = firstName(user?.name);

  return (
    <div className="relative flex min-h-svh items-center justify-center overflow-hidden bg-white px-4 py-10 sm:px-6 sm:py-12">
      <BrandPageBackground variant="absolute" blurHeight="55%" />

      <div className="relative z-10 w-full max-w-md md:max-w-2xl">
        <div className="relative">
          <BrandCardBirds />

          <div className={`${marketingCardClassName} md:overflow-hidden md:p-0`}>
            <div className="flex flex-col gap-6 md:grid md:grid-cols-[1.1fr_0.9fr] md:items-stretch md:gap-0">
              <div className="md:p-8">
                <div className="mb-5 flex justify-center">
                  <BrandLogo size="lg" />
                </div>

                <h1 className={marketingTitleClassName}>
                  {name}, falta só um passo
                </h1>
                <p className={`${marketingBodyClassName} mt-2.5`}>
                  A BoxVet é exclusiva para assinantes. Ative sua assinatura e entre
                  agora no sistema da sua clínica, faça parte da comunidade, e ajude
                  a construir a plataforma ideal.
                </p>

                <ul className="mt-5 space-y-2">
                  {subscriptionBenefits.map((benefit) => (
                    <li key={benefit} className={`flex gap-2.5 ${marketingListItemClassName}`}>
                      <span className="shrink-0 text-foreground/45" aria-hidden>
                        —
                      </span>
                      <span>{benefit}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="md:flex md:flex-col md:justify-end md:border-l md:border-border/60 md:p-8">
                <div className="border-t border-border/60 pt-5 md:border-t-0 md:pt-0">
                  <p className="text-3xl font-bold tracking-tight text-foreground">
                    {SUBSCRIPTION_PRICE}
                  </p>
                  <ul className="mt-3 space-y-2">
                    <li className="flex items-start gap-2.5 text-sm leading-relaxed text-muted-foreground">
                      <QrCode
                        className="mt-0.5 size-4 shrink-0 text-foreground/55"
                        aria-hidden
                      />
                      <span>Pix (30 dias)</span>
                    </li>
                    <li className="flex items-start gap-2.5 text-sm leading-relaxed text-muted-foreground">
                      <CreditCard
                        className="mt-0.5 size-4 shrink-0 text-foreground/55"
                        aria-hidden
                      />
                      <span>Cartão (cancele quando quiser)</span>
                    </li>
                  </ul>
                </div>

                <div className="mt-5 border-t border-border/60 pt-5 md:border-t-0 md:pt-6">
                  <Button
                    className={`${landingPrimaryButtonClassName} w-full text-sm font-semibold uppercase tracking-wide`}
                    render={<Link to="/assinatura/pagamento" />}
                  >
                    Fazer parte →
                  </Button>
                </div>

                <p className="mt-4 text-center text-xs text-muted-foreground md:text-left">
                  pagamento seguro via AbacatePay 🥑
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
