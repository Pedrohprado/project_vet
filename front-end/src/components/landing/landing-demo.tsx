import { useState } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { demoSlides } from '@/lib/landing-content';
import { cn } from '@/lib/utils';
import { DashboardMockup } from './dashboard-mockup';
import { LandingSection } from './landing-section';

export function LandingDemo() {
  const [activeIndex, setActiveIndex] = useState(0);
  const slide = demoSlides[activeIndex];

  function goPrev() {
    setActiveIndex((i) => (i === 0 ? demoSlides.length - 1 : i - 1));
  }

  function goNext() {
    setActiveIndex((i) => (i === demoSlides.length - 1 ? 0 : i + 1));
  }

  return (
    <LandingSection
      id="demonstracao"
      title="Demonstração do sistema"
      subtitle="Veja como a BoxVet acompanha sua clínica do cadastro ao pós-consulta."
    >
      <div className="mx-auto max-w-2xl">
        <div className="mb-6 flex items-center justify-between gap-4">
          <Button
            variant="outline"
            size="icon"
            className="rounded-xl"
            onClick={goPrev}
            aria-label="Slide anterior"
          >
            <ChevronLeft />
          </Button>
          <div className="flex flex-wrap justify-center gap-2">
            {demoSlides.map((s, i) => (
              <button
                key={s.id}
                type="button"
                onClick={() => setActiveIndex(i)}
                className={cn(
                  'rounded-full px-3 py-1 text-xs font-medium transition-colors',
                  i === activeIndex
                    ? 'bg-primary text-primary-foreground'
                    : 'bg-muted text-muted-foreground hover:bg-muted/80',
                )}
              >
                {s.label}
              </button>
            ))}
          </div>
          <Button
            variant="outline"
            size="icon"
            className="rounded-xl"
            onClick={goNext}
            aria-label="Próximo slide"
          >
            <ChevronRight />
          </Button>
        </div>
        <DashboardMockup variant={slide.variant} />
      </div>
    </LandingSection>
  );
}
