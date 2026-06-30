import { cn } from '@/lib/utils';
import { Card, CardContent } from '@/components/ui/card';

export function AuthCardLayout({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={cn('flex flex-col gap-6', className)}>
      <Card className="h-[min(34rem,calc(100svh-5rem))] overflow-hidden p-0">
        <CardContent className="grid h-full min-h-0 p-0 md:grid-cols-2">
          <div className="flex h-full min-h-0 flex-col overflow-hidden p-6 md:p-8">
            {children}
          </div>
          <div className="hidden h-full min-h-0 bg-black md:block" />
        </CardContent>
      </Card>
    </div>
  );
}
