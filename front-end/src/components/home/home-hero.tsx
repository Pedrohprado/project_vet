import { TURTLE_GRASS_SRC } from '@/lib/brand';

type HomeHeroProps = {
  userName: string;
  clinicName?: string;
  reminderCount?: number;
};

export function HomeHero({ userName, clinicName, reminderCount }: HomeHeroProps) {
  const firstName = userName.split(' ')[0] ?? userName;

  return (
    <section className="relative overflow-hidden rounded-2xl border border-border/50 bg-white/90 p-6 shadow-xl shadow-black/4 backdrop-blur-sm sm:p-8">
      <img
        src={TURTLE_GRASS_SRC}
        alt=""
        aria-hidden
        className="pointer-events-none absolute -right-3 -bottom-3 hidden h-28 w-auto object-contain object-bottom opacity-90 sm:block sm:h-32 lg:-right-4 lg:-bottom-4 lg:h-40"
      />

      <div className="relative z-10 max-w-2xl pr-0 sm:pr-32 lg:pr-44">
        <p className="text-sm font-medium text-primary">Início</p>
        <h1 className="mt-1 text-2xl font-bold tracking-tight sm:text-3xl">
          Olá, {firstName}!
        </h1>
        <p className="mt-2 text-sm leading-relaxed text-muted-foreground sm:text-base">
          {clinicName ? (
            <>
              Aqui está o resumo da{' '}
              <span className="font-medium text-foreground underline decoration-primary decoration-2 underline-offset-[6px]">
                {clinicName}
              </span>{' '}
              para os próximos dias.
            </>
          ) : (
            'Aqui está o resumo da sua clínica para os próximos dias.'
          )}
        </p>
        {reminderCount !== undefined ? (
          <p className="mt-3 text-sm text-foreground/80">
            {reminderCount === 0
              ? 'Nenhum lembrete para esta semana.'
              : reminderCount === 1
                ? '1 lembrete na semana.'
                : `${reminderCount} lembretes na semana.`}
          </p>
        ) : null}
      </div>
    </section>
  );
}
