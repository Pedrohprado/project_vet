import { CreditCard } from 'lucide-react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  pageDescriptionClassName,
  pageShellClassName,
  pageTitleClassName,
} from '@/lib/mobile-ui';

export function AdminFinancePage() {
  return (
    <div className={pageShellClassName}>
      <div>
        <h1 className={pageTitleClassName}>Financeiro</h1>
        <p className={pageDescriptionClassName}>
          Gestão de assinaturas e pagamentos da plataforma.
        </p>
      </div>

      <Card className="max-w-2xl">
        <CardHeader className="space-y-3">
          <div className="flex size-12 items-center justify-center rounded-xl bg-primary/10 text-primary">
            <CreditCard className="size-6" />
          </div>
          <CardTitle>Em breve</CardTitle>
          <CardDescription>
            Esta área será utilizada para acompanhar receitas, assinaturas e cobranças via
            AbacatePay. Por enquanto, utilize as seções de clínicas e tutores para monitorar
            o crescimento da plataforma.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            Integração financeira planejada para uma próxima etapa do projeto.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
