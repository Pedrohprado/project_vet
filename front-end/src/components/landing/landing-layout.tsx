import { BrandPageBackground } from '@/components/brand-page-background';
import { LandingFooter } from './landing-footer';
import { LandingNavbar } from './landing-navbar';

type LandingLayoutProps = {
  children: React.ReactNode;
};

export function LandingLayout({ children }: LandingLayoutProps) {
  return (
    <div className="relative min-h-svh overflow-x-hidden bg-white">
      <BrandPageBackground variant="fixed" />

      <div className="relative z-10">
        <LandingNavbar />
        <main>{children}</main>
        <LandingFooter />
      </div>
    </div>
  );
}
