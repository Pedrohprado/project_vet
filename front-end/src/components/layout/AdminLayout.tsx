import { Outlet } from 'react-router';
import { AdminSidebar } from '@/components/admin-sidebar';
import { Separator } from '@/components/ui/separator';
import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from '@/components/ui/sidebar';
import { TooltipProvider } from '@/components/ui/tooltip';

export function AdminLayout() {
  return (
    <TooltipProvider>
      <SidebarProvider defaultOpen={false}>
        <AdminSidebar />
        <SidebarInset>
          <header className="flex h-14 shrink-0 items-center gap-2 border-b px-4 pt-[env(safe-area-inset-top)]">
            <SidebarTrigger className="-ml-1" />
            <Separator orientation="vertical" className="mr-2 h-4" />
            <span className="text-sm font-medium text-muted-foreground">
              Painel da plataforma
            </span>
          </header>
          <main className="flex flex-1 flex-col gap-4 p-4 pb-[calc(1rem+env(safe-area-inset-bottom))] sm:p-6">
            <Outlet />
          </main>
        </SidebarInset>
      </SidebarProvider>
    </TooltipProvider>
  );
}
