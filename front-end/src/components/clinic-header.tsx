import { BrandLogo } from '@/components/brand/brand-logo';
import {
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from '@/components/ui/sidebar';
import { APP_NAME } from '@/lib/brand';
import type { Clinic } from '@/types/auth';

export function ClinicHeader({ clinic }: { clinic: Clinic | null }) {
  return (
    <SidebarMenu>
      <SidebarMenuItem className="group-data-[collapsible=icon]:flex group-data-[collapsible=icon]:justify-center">
        <SidebarMenuButton
          size="lg"
          className="pointer-events-none hover:bg-transparent active:bg-transparent group-data-[collapsible=icon]:justify-center"
        >
          <div className="flex aspect-square size-8 shrink-0 items-center justify-center overflow-hidden rounded-lg">
            <BrandLogo size="sm" className="gap-0" />
          </div>
          <div className="grid flex-1 text-left text-sm leading-tight group-data-[collapsible=icon]:hidden">
            <span className="truncate font-medium">
              {clinic?.name ?? APP_NAME}
            </span>
            <span className="truncate text-xs text-muted-foreground">
              Clínica veterinária
            </span>
          </div>
        </SidebarMenuButton>
      </SidebarMenuItem>
    </SidebarMenu>
  );
}
