import { AlertTriangle, Check, X } from 'lucide-react';
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
  return (
    <LandingSection
      title="Comparativo"
      subtitle="BoxVet vs ERP tradicional — o que realmente importa para sua clínica."
    >
      <div className="overflow-x-auto rounded-2xl border border-border/50 bg-white shadow-xl shadow-black/4">
        <table className="w-full min-w-[480px] text-left text-sm">
          <thead>
            <tr className="border-b border-border/50 bg-muted/30">
              <th className="px-4 py-3 font-semibold sm:px-6">Recurso</th>
              <th className="px-4 py-3 font-semibold text-primary sm:px-6">
                BoxVet
              </th>
              <th className="px-4 py-3 font-semibold text-muted-foreground sm:px-6">
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
    </LandingSection>
  );
}
