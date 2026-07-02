import { Building2, CreditCard, Home } from 'lucide-react';
import { useLocation } from 'react-router';
import { BrandLogo } from '@/components/brand/brand-logo';
import { NavMain } from '@/components/nav-main';
import { NavUser } from '@/components/nav-user';
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarRail,
} from '@/components/ui/sidebar';
import { useAuth } from '@/hooks/useAuth';
import { APP_NAME } from '@/lib/brand';

const navItems = [
  { title: 'Visão geral', url: '/admin', icon: Home },
  { title: 'Clínicas', url: '/admin/clinicas', icon: Building2 },
  { title: 'Financeiro', url: '/admin/financeiro', icon: CreditCard },
];

export function AdminSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const { user, logout } = useAuth();
  const location = useLocation();

  const items = navItems.map((item) => ({
    ...item,
    icon: <item.icon />,
    isActive:
      item.url === '/admin'
        ? location.pathname === '/admin'
        : location.pathname.startsWith(item.url),
  }));

  return (
    <Sidebar collapsible="icon" {...props}>
      <SidebarHeader>
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
                <span className="truncate font-medium">{APP_NAME}</span>
                <span className="truncate text-xs text-muted-foreground">
                  Administração
                </span>
              </div>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent>
        <NavMain items={items} />
      </SidebarContent>
      <SidebarFooter>
        {user ? <NavUser user={user} onLogout={logout} /> : null}
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  );
}
