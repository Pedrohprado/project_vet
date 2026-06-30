import { LandingFooter } from './landing-footer';
import { LandingNavbar } from './landing-navbar';

type LandingLayoutProps = {
  children: React.ReactNode;
};

export function LandingLayout({ children }: LandingLayoutProps) {
  return (
    <div className="relative min-h-svh overflow-x-hidden bg-white">
      <div className="auth-grid-bg pointer-events-none fixed inset-0" aria-hidden />
      <div
        className="auth-yellow-blur pointer-events-none fixed inset-x-0 bottom-0 h-[40%]"
        aria-hidden
      />

      <div className="relative z-10">
        <LandingNavbar />
        <main>{children}</main>
        <LandingFooter />
      </div>
    </div>
  );
}
