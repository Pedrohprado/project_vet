import { Link } from 'react-router';
import { ChevronLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';

export function PageBackButton({ to }: { to: string }) {
  return (
    <Button variant="ghost" size="sm" className="-ml-2.5 w-fit gap-1 px-2" asChild>
      <Link to={to}>
        <ChevronLeft className="size-4" />
        Voltar
      </Link>
    </Button>
  );
}
