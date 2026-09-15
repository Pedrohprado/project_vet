import { useState } from 'react';
import { PawPrint, Stethoscope, User, type LucideIcon } from 'lucide-react';
import { useNavigate } from 'react-router';
import { toast } from 'sonner';
import { ApiError } from '@/api/http';
import { BrandLogo } from '@/components/brand/brand-logo';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogFooter,
} from '@/components/ui/dialog';
import { Field, FieldLabel } from '@/components/ui/field';
import { Input } from '@/components/ui/input';
import { useAuth } from '@/hooks/useAuth';
import { getCommunityBasePath } from '@/lib/community-paths';
import {
  marketingBodyClassName,
  marketingListItemClassName,
  marketingTitleClassName,
} from '@/lib/landing-styles';
import { cn } from '@/lib/utils';

const TOTAL_STEPS = 5;

type BulletItem = {
  text: string;
  icon: LucideIcon;
};

type StepContent = {
  title: string;
  description: string;
  bullets?: BulletItem[];
};

const STEP_COPY: Record<number, StepContent> = {
  1: {
    title: 'Bem-vindo ao Box Vet!',
    description:
      'Obrigado por apoiar o projeto e por fazer parte dessa comunidade. Estamos felizes em ter você com a gente construindo uma plataforma pensada para a rotina da clínica.',
  },
  2: {
    title: 'Seu CRMV',
    description:
      'Informe seu CRMV para aparecer nas receitas e na comunidade. Você pode preencher agora ou deixar para depois no perfil.',
  },
  3: {
    title: 'Por onde começar',
    description:
      'O fluxo básico é simples: cadastre um tutor, adicione os pets vinculados a ele e, em seguida, inicie um atendimento, uma consulta ou um agendamento.',
    bullets: [
      { text: 'Cadastre seu primeiro tutor', icon: User },
      { text: 'Adicione os pets vinculados a esse tutor', icon: PawPrint },
      {
        text: 'Inicie um atendimento, consulta ou agendamento',
        icon: Stethoscope,
      },
    ],
  },
  4: {
    title: 'Comunidade de casos',
    description:
      'Na comunidade você troca experiências com outros veterinários: casos clínicos anonimizados, comentários e aprendizados do dia a dia.',
  },
  5: {
    title: 'Roadmap aberto',
    description:
      'No roadmap você acompanha o que estamos construindo e pode contribuir com ideias e sugestões para evoluir a plataforma junto com a gente.',
  },
};

function OnboardingBulletList({ items }: { items: BulletItem[] }) {
  return (
    <ul className="mt-4 space-y-2.5">
      {items.map((item) => {
        const Icon = item.icon;

        return (
          <li
            key={item.text}
            className={cn('flex gap-3', marketingListItemClassName)}
          >
            <Icon
              className="mt-0.5 size-4 shrink-0 text-foreground/55"
              aria-hidden
            />
            <span className="min-w-0 flex-1">{item.text}</span>
          </li>
        );
      })}
    </ul>
  );
}

export function OnboardingWelcomeDialog() {
  const navigate = useNavigate();
  const { user, clinic, isFirstAccess, completeWelcome, updateProfile } =
    useAuth();
  const [step, setStep] = useState(1);
  const [crmv, setCrmv] = useState(user?.crmv ?? '');
  const [isBusy, setIsBusy] = useState(false);

  const open = Boolean(isFirstAccess && user && clinic);
  const copy = STEP_COPY[step] ?? STEP_COPY[1];
  const hasSecondaryAction = step >= 3;

  async function finishAndGo(path?: string) {
    setIsBusy(true);

    try {
      await completeWelcome();
      if (path) {
        void navigate(path);
      }
    } catch (err) {
      toast.error(
        err instanceof ApiError
          ? err.message
          : 'Não foi possível concluir as boas-vindas.',
      );
    } finally {
      setIsBusy(false);
    }
  }

  async function handleNextFromCrmv() {
    setIsBusy(true);

    try {
      const normalizedCrmv = crmv.trim() || null;
      const currentCrmv = user?.crmv?.trim() || null;

      if (normalizedCrmv !== currentCrmv) {
        await updateProfile({ crmv: normalizedCrmv });
      }

      setStep(3);
    } catch (err) {
      toast.error(
        err instanceof ApiError ? err.message : 'Erro ao salvar o CRMV.',
      );
    } finally {
      setIsBusy(false);
    }
  }

  function handleOpenChange(nextOpen: boolean) {
    if (!nextOpen) return;
  }

  return (
    <Dialog
      open={open}
      onOpenChange={handleOpenChange}
      disablePointerDismissal
    >
      <DialogContent
        showCloseButton={false}
        className="gap-0 p-0 sm:max-w-2xl"
      >
        <div className="space-y-5 p-6 sm:p-8">
          <div className="flex flex-col items-center gap-2 border-b border-border/50 pb-5">
            <BrandLogo size="xl" className="justify-center" />
            <p className="text-center text-xs font-medium text-muted-foreground">
              {step} de {TOTAL_STEPS}
            </p>
          </div>

          <div>
            <h2 className={marketingTitleClassName}>{copy.title}</h2>
            <p className={cn(marketingBodyClassName, 'mt-2.5')}>
              {copy.description}
            </p>
            {copy.bullets ? (
              <OnboardingBulletList items={copy.bullets} />
            ) : null}
          </div>

          {step === 2 ? (
            <Field className="pt-1">
              <FieldLabel htmlFor="onboarding-crmv">CRMV</FieldLabel>
              <Input
                id="onboarding-crmv"
                value={crmv}
                onChange={(event) => setCrmv(event.target.value)}
              placeholder="Ex.: 12345-SP"
              autoComplete="off"
            />
          </Field>
          ) : null}
        </div>

        <DialogFooter
          className={cn(
            'gap-2 border-t border-border/50 bg-muted/20 px-6 py-4 sm:px-8',
            hasSecondaryAction ? 'sm:justify-between' : 'sm:justify-end',
          )}
        >
          {step === 3 ? (
            <Button
              type="button"
              variant="outline"
              disabled={isBusy}
              onClick={() => void finishAndGo('/tutors/new')}
            >
              Iniciar processo
            </Button>
          ) : null}

          {step === 4 ? (
            <Button
              type="button"
              variant="outline"
              disabled={isBusy}
              onClick={() => void finishAndGo(getCommunityBasePath(user))}
            >
              Ver comunidade
            </Button>
          ) : null}

          {step === 5 ? (
            <Button
              type="button"
              variant="outline"
              disabled={isBusy}
              onClick={() => void finishAndGo('/roadmap')}
            >
              Ver roadmap
            </Button>
          ) : null}

          {step < 5 ? (
            <Button
              type="button"
              disabled={isBusy}
              onClick={() => {
                if (step === 2) {
                  void handleNextFromCrmv();
                  return;
                }
                setStep((current) => current + 1);
              }}
            >
              {isBusy && step === 2 ? 'Salvando...' : 'Próximo'}
            </Button>
          ) : (
            <Button
              type="button"
              disabled={isBusy}
              onClick={() => void finishAndGo()}
            >
              {isBusy ? 'Concluindo...' : 'Concluir'}
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
