import { Link } from 'react-router';
import { BrandLogo } from '@/components/brand/brand-logo';
import { Button } from '@/components/ui/button';
import { navLinks } from '@/lib/landing-content';
import { cn } from '@/lib/utils';
import {
  landingOutlineButtonClassName,
  landingPrimaryButtonClassName,
} from './landing-section';

export function LandingNavbar() {
  return (
    <header className="sticky top-0 z-50 border-b border-border/50 bg-white/80 backdrop-blur-sm">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between gap-4 px-4 sm:px-6">
        <Link to="/" className="flex shrink-0 items-center gap-2">
          <BrandLogo size="sm" />
          <span className="text-xl font-bold tracking-tight text-primary">
            boxvet.
          </span>
        </Link>

        <nav className="hidden items-center gap-6 md:flex">
          {navLinks.map((link) => (
            <a
              key={link.href}
              href={link.href}
              className="text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
            >
              {link.label}
            </a>
          ))}
        </nav>

        <div className="flex shrink-0 items-center gap-2 sm:gap-3">
          <Button
            variant="outline"
            className={cn(landingOutlineButtonClassName, 'hidden sm:inline-flex')}
            render={<Link to="/login" />}
          >
            Entrar
          </Button>
          <Button
            className={landingPrimaryButtonClassName}
            render={<Link to="/register" />}
          >
            Começar gratuitamente
          </Button>
        </div>
      </div>
    </header>
  );
}
