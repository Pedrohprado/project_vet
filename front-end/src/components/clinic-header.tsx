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
      <SidebarMenuItem>
        <SidebarMenuButton
          size="lg"
          className="pointer-events-none hover:bg-transparent active:bg-transparent"
        >
          <div className="flex aspect-square size-8 items-center justify-center overflow-hidden rounded-lg bg-black">
            <BrandLogo size="sm" />
          </div>
          <div className="grid flex-1 text-left text-sm leading-tight">
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
