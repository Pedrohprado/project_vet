import { Calendar, Home, Stethoscope, Users } from 'lucide-react';
import { useLocation } from 'react-router';
import { ClinicHeader } from '@/components/clinic-header';
import { NavMain } from '@/components/nav-main';
import { NavUser } from '@/components/nav-user';
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarRail,
} from '@/components/ui/sidebar';
import { useAuth } from '@/hooks/useAuth';

const navItems = [
  { title: 'Início', url: '/estatisticas', icon: Home },
  { title: 'Agenda', url: '/agenda', icon: Calendar },
  { title: 'Atendimento', url: '/atendimento', icon: Stethoscope },
  { title: 'Tutores', url: '/tutors', icon: Users },
];

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const { user, clinic, logout } = useAuth();
  const location = useLocation();

  const items = navItems.map((item) => ({
    ...item,
    icon: <item.icon />,
    isActive: location.pathname.startsWith(item.url),
  }));

  return (
    <Sidebar collapsible="icon" {...props}>
      <SidebarHeader>
        <ClinicHeader clinic={clinic} />
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
