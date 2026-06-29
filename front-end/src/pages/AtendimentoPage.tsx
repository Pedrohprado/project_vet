import { Link } from 'react-router';
import { Search, UserPlus } from 'lucide-react';
import { Button } from '@/components/ui/button';
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

export function AtendimentoPage() {
  return (
    <div className={pageShellClassName}>
      <div>
        <h1 className={pageTitleClassName}>Atendimento</h1>
        <p className={pageDescriptionClassName}>
          Como o tutor entrou em contato, escolha como iniciar o atendimento.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-4">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <UserPlus className="size-5" />
              Novo Tutor
            </CardTitle>
            <CardDescription>
              Cenário 1 — Tutor ainda não cadastrado no sistema.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button asChild className="w-full">
              <Link to="/tutors/new">Cadastrar Tutor</Link>
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Search className="size-5" />
              Buscar Tutor
            </CardTitle>
            <CardDescription>
              Cenários 2 e 3 — Tutor já cadastrado, selecionar pet existente ou novo.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button asChild variant="outline" className="w-full">
              <Link to="/tutors">Buscar Tutor</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
