import { OPEN_BOX_SRC } from '@/lib/brand';

type HomeHeroProps = {
  userName: string;
  clinicName?: string;
  reminderCount?: number;
};

export function HomeHero({ userName, clinicName, reminderCount }: HomeHeroProps) {
  const firstName = userName.split(' ')[0] ?? userName;

  return (
    <section className="relative overflow-hidden rounded-2xl border border-border/50 bg-white/90 p-4 shadow-xl shadow-black/4 backdrop-blur-sm sm:p-5">
      <img
        src={OPEN_BOX_SRC}
        alt=""
        aria-hidden
        className="pointer-events-none absolute right-2 bottom-0 hidden h-20 w-auto object-contain object-bottom opacity-90 sm:block sm:h-24 lg:right-4 lg:h-28"
      />

      <div className="relative z-10 max-w-2xl pr-0 sm:pr-28 lg:pr-36">
        <p className="text-xs font-medium text-primary">
          {clinicName ?? 'Sua clínica'}
        </p>
        <h1 className="mt-0.5 text-xl font-bold tracking-tight sm:text-2xl">
          Olá, {firstName}!
        </h1>
        <p className="mt-1 text-sm leading-relaxed text-muted-foreground">
          Resumo da clínica para os próximos dias.
        </p>
        {reminderCount ? (
          <p className="mt-2 text-sm text-foreground/80">
            {reminderCount === 1
              ? '1 lembrete na semana.'
              : `${reminderCount} lembretes na semana.`}
          </p>
        ) : null}
      </div>
    </section>
  );
}
