import { Outlet } from 'react-router';
import { AppSidebar } from '@/components/app-sidebar';
import { Separator } from '@/components/ui/separator';
import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from '@/components/ui/sidebar';
import { TooltipProvider } from '@/components/ui/tooltip';

export function AppLayout() {
  return (
    <TooltipProvider>
      <SidebarProvider defaultOpen={false}>
        <AppSidebar />
        <SidebarInset>
          <header className="flex h-10 shrink-0 items-center gap-2 border-b px-4 pt-[env(safe-area-inset-top)]">
            <SidebarTrigger className="-ml-1" />
            <Separator orientation="vertical" className="mr-2 h-4" />
          </header>
          <main className="flex flex-1 flex-col gap-4 p-4 pb-[calc(1rem+env(safe-area-inset-bottom))] sm:p-6">
            <Outlet />
          </main>
        </SidebarInset>
      </SidebarProvider>
    </TooltipProvider>
  );
}
