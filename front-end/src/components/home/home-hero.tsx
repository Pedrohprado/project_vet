import { OPEN_BOX_SRC } from '@/lib/brand';

type HomeHeroProps = {
  userName: string;
  clinicName?: string;
  reminderCount?: number;
};

function formatToday() {
  return new Date().toLocaleDateString('pt-BR', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
  });
}

export function HomeHero({ userName, clinicName, reminderCount }: HomeHeroProps) {
  const firstName = userName.split(' ')[0] ?? userName;
  const todayLabel = formatToday();
  const capitalizedToday =
    todayLabel.charAt(0).toUpperCase() + todayLabel.slice(1);

  return (
    <section className="relative overflow-hidden rounded-2xl border border-border/50 bg-white/90 p-4 shadow-xl shadow-black/4 backdrop-blur-sm sm:p-6">
      <img
        src={OPEN_BOX_SRC}
        alt=""
        aria-hidden
        loading="lazy"
        decoding="async"
        className="pointer-events-none absolute right-2 bottom-0 hidden h-20 w-auto object-contain object-bottom opacity-90 sm:block sm:h-24 lg:right-4 lg:h-28"
      />

      <div className="relative z-10 max-w-2xl pr-0 sm:pr-28 lg:pr-36">
        <p className="inline-flex rounded-full bg-primary/10 px-2.5 py-0.5 text-xs font-medium text-primary">
          {clinicName ?? 'Sua clínica'}
        </p>
        <h1 className="mt-2 text-xl font-bold tracking-tight sm:text-2xl">
          Olá, {firstName}!
        </h1>
        <p className="mt-1 text-sm leading-relaxed text-muted-foreground">
          {capitalizedToday}
        </p>
        {reminderCount ? (
          <a
            href="#lembretes"
            className="mt-2 inline-flex text-sm font-medium text-foreground/80 underline-offset-4 hover:underline"
          >
            {reminderCount === 1
              ? '1 lembrete na semana'
              : `${reminderCount} lembretes na semana`}
          </a>
        ) : null}
      </div>
    </section>
  );
}
