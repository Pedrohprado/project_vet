import { useEffect, useRef, useState } from 'react';
import { AlertTriangle, Check, X } from 'lucide-react';
import { BIRD_SRC } from '@/lib/brand';
import {
  comparisonRows,
  type ComparisonCell,
} from '@/lib/landing-content';
import { cn } from '@/lib/utils';
import { LandingSection } from './landing-section';

function ComparisonCellDisplay({ cell }: { cell: ComparisonCell }) {
  if (cell.type === 'text') {
    return <span className="text-sm font-medium">{cell.value}</span>;
  }
  if (cell.type === 'yes') {
    return (
      <span className="inline-flex items-center gap-1.5 text-sm font-medium">
        <Check className="size-4 text-primary" />
        Sim
      </span>
    );
  }
  if (cell.type === 'partial') {
    return (
      <span className="inline-flex items-center gap-1.5 text-sm text-muted-foreground">
        <AlertTriangle className="size-4 text-primary/70" />
        Parcial
      </span>
    );
  }
  return (
    <span className="inline-flex items-center gap-1.5 text-sm text-muted-foreground">
      <X className="size-4" />
      Não
    </span>
  );
}

export function LandingComparison() {
  const sectionRef = useRef<HTMLDivElement>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const boxvetHeaderRef = useRef<HTMLTableCellElement>(null);
  const erpHeaderRef = useRef<HTMLTableCellElement>(null);
  const [birdsVisible, setBirdsVisible] = useState(true);
  const [birdsLeft, setBirdsLeft] = useState<number | null>(null);

  useEffect(() => {
    const section = sectionRef.current;
    const container = scrollRef.current;
    const boxvetHeader = boxvetHeaderRef.current;
    const erpHeader = erpHeaderRef.current;
    if (!section || !container || !boxvetHeader || !erpHeader) return;

    const mobileQuery = window.matchMedia('(max-width: 639px)');
    const ERP_REVEAL_THRESHOLD = 56;

    const updateBirds = () => {
      const containerRect = container.getBoundingClientRect();
      const boxvetRect = boxvetHeader.getBoundingClientRect();
      const erpRect = erpHeader.getBoundingClientRect();
      const sectionRect = section.getBoundingClientRect();

      const boxvetCenter =
        boxvetRect.left + boxvetRect.width / 2 - sectionRect.left;

      if (mobileQuery.matches) {
        setBirdsLeft(null);
      } else {
        setBirdsLeft(boxvetCenter);
      }

      const erpVisibleWidth = Math.max(
        0,
        Math.min(erpRect.right, containerRect.right) -
          Math.max(erpRect.left, containerRect.left),
      );
      const erpIsShowing = erpVisibleWidth >= ERP_REVEAL_THRESHOLD;

      if (!mobileQuery.matches) {
        setBirdsVisible(true);
        return;
      }

      setBirdsVisible(!erpIsShowing);
    };

    updateBirds();
    container.addEventListener('scroll', updateBirds, { passive: true });
    window.addEventListener('resize', updateBirds);
    mobileQuery.addEventListener('change', updateBirds);

    const resizeObserver = new ResizeObserver(updateBirds);
    resizeObserver.observe(container);
    resizeObserver.observe(section);

    return () => {
      container.removeEventListener('scroll', updateBirds);
      window.removeEventListener('resize', updateBirds);
      mobileQuery.removeEventListener('change', updateBirds);
      resizeObserver.disconnect();
    };
  }, []);

  return (
    <LandingSection
      title="Comparativo"
      subtitle="Por que a BoxVet não é só mais um sistema veterinário?"
    >
      <div
        ref={sectionRef}
        className="relative pt-10 sm:pt-12"
      >
        <div
          className={cn(
            'pointer-events-none absolute top-10 z-20 flex items-end gap-1 transition-opacity duration-300 ease-in-out sm:top-12 sm:opacity-100',
            birdsLeft === null && 'left-1/2',
            birdsVisible ? 'opacity-100' : 'opacity-0',
          )}
          style={{
            ...(birdsLeft !== null ? { left: birdsLeft } : {}),
            transform: 'translate(-50%, -58%)',
          }}
          aria-hidden={!birdsVisible}
        >
          {[0, 1, 2].map((index) => (
            <img
              key={index}
              src={BIRD_SRC}
              alt=""
              className="h-11 w-auto object-contain lg:h-12"
            />
          ))}
        </div>

        <div
          ref={scrollRef}
          className="relative z-10 overflow-x-auto rounded-2xl border border-border/50 bg-white shadow-xl shadow-black/4"
        >
          <table className="w-full min-w-[480px] text-left text-sm">
            <thead>
              <tr className="border-b border-border/50 bg-muted/30">
                <th className="px-4 py-3 font-semibold sm:px-6">Recurso</th>
                <th
                  ref={boxvetHeaderRef}
                  className="px-4 py-3 font-semibold text-primary sm:px-6"
                >
                  BoxVet
                </th>
                <th
                  ref={erpHeaderRef}
                  className="px-4 py-3 font-semibold text-muted-foreground sm:px-6"
                >
                  ERP tradicional
                </th>
              </tr>
            </thead>
            <tbody>
              {comparisonRows.map((row, index) => (
                <tr
                  key={row.feature}
                  className={cn(
                    index < comparisonRows.length - 1 &&
                      'border-b border-border/50',
                  )}
                >
                  <td className="px-4 py-4 font-medium sm:px-6">{row.feature}</td>
                  <td className="px-4 py-4 sm:px-6">
                    <ComparisonCellDisplay cell={row.boxvet} />
                  </td>
                  <td className="px-4 py-4 sm:px-6">
                    <ComparisonCellDisplay cell={row.erp} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </LandingSection>
  );
}
