import type { ReactNode } from 'react';
import { PawPrint } from 'lucide-react';
import { PageBackButton } from '@/components/page-back-button';
import { Badge, type BadgeVariant } from '@/components/ui/badge';
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from '@/components/ui/avatar';
import { Card, CardContent } from '@/components/ui/card';
import { pageTitleClassName } from '@/lib/mobile-ui';
import { cn } from '@/lib/utils';

type ServiceDetailMeta = {
  label: string;
  value: string;
};

type ServiceDetailHeaderProps = {
  backTo?: string;
  title: string;
  statusLabel: string;
  statusVariant?: BadgeVariant;
  statusClassName?: string;
  petName: string;
  petPhotoUrl?: string | null;
  petSubtitle: string;
  tutorName: string;
  meta: ServiceDetailMeta[];
  highlight?: ReactNode;
  actions?: ReactNode;
};

export function ServiceDetailHeader({
  backTo,
  title,
  statusLabel,
  statusVariant = 'default',
  statusClassName,
  petName,
  petPhotoUrl,
  petSubtitle,
  tutorName,
  meta,
  highlight,
  actions,
}: ServiceDetailHeaderProps) {
  return (
    <div className="space-y-4">
      {backTo ? <PageBackButton to={backTo} /> : null}

      <div className="flex flex-wrap items-center gap-2">
        <h1 className={pageTitleClassName}>{title}</h1>
        <Badge variant={statusVariant} className={cn(statusClassName)}>
          {statusLabel}
        </Badge>
      </div>

      <Card className="shadow-none ring-0">
        <CardContent className="flex flex-col gap-4 p-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex min-w-0 items-center gap-3">
            <Avatar className="size-12 shrink-0 sm:size-14">
              {petPhotoUrl ? (
                <AvatarImage src={petPhotoUrl} alt={petName} />
              ) : null}
              <AvatarFallback className="bg-primary/10 text-primary">
                <PawPrint className="size-5" />
              </AvatarFallback>
            </Avatar>
            <div className="min-w-0">
              <p className="truncate text-base font-semibold sm:text-lg">
                {petName}
              </p>
              <p className="text-sm text-muted-foreground">{petSubtitle}</p>
              <p className="text-sm text-muted-foreground">{tutorName}</p>
            </div>
          </div>

          {meta.length > 0 ? (
            <dl className="grid min-w-0 grid-cols-2 gap-x-6 gap-y-2 sm:text-right">
              {meta.map((item) => (
                <div key={item.label} className="min-w-0">
                  <dt className="text-xs text-muted-foreground">{item.label}</dt>
                  <dd className="truncate text-sm font-medium">{item.value}</dd>
                </div>
              ))}
            </dl>
          ) : null}
        </CardContent>
      </Card>

      {highlight}

      {actions ? (
        <div className="flex flex-wrap gap-2">{actions}</div>
      ) : null}
    </div>
  );
}
