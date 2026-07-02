import { Menu } from 'lucide-react';
import { Link } from 'react-router';
import { BrandLogo } from '@/components/brand/brand-logo';
import { Button } from '@/components/ui/button';
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet';
import { heroContent, navLinks } from '@/lib/landing-content';
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

        <div className="hidden shrink-0 items-center gap-2 sm:gap-3 md:flex">
          <Button
            variant="outline"
            className={landingOutlineButtonClassName}
            render={<Link to="/login" />}
          >
            Entrar
          </Button>
          <Button
            className={landingPrimaryButtonClassName}
            render={<a href={heroContent.plansHref} />}
          >
            {heroContent.primaryCta}
          </Button>
        </div>

        <Sheet>
          <SheetTrigger
            className="md:hidden"
            render={
              <Button variant="ghost" size="icon" aria-label="Abrir menu" />
            }
          >
            <Menu />
          </SheetTrigger>
          <SheetContent side="right" className="w-full max-w-xs gap-0 p-0">
            <SheetHeader className="border-b border-border/50 p-4 text-left">
              <SheetTitle className="flex items-center gap-2">
                <BrandLogo size="sm" />
                <span className="text-lg font-bold text-primary">boxvet.</span>
              </SheetTitle>
              <SheetDescription className="sr-only">
                Navegação da landing page
              </SheetDescription>
            </SheetHeader>

            <nav className="flex flex-col p-2">
              {navLinks.map((link) => (
                <SheetClose
                  key={link.href}
                  nativeButton={false}
                  render={
                    <a
                      href={link.href}
                      className="rounded-lg px-3 py-3 text-base font-medium text-foreground transition-colors hover:bg-muted"
                    />
                  }
                >
                  {link.label}
                </SheetClose>
              ))}
            </nav>

            <div className="mt-auto flex flex-col gap-2 border-t border-border/50 p-4">
              <SheetClose
                nativeButton={false}
                render={
                  <Button
                    variant="outline"
                    className={cn(landingOutlineButtonClassName, 'w-full')}
                    render={<Link to="/login" />}
                  />
                }
              >
                Entrar
              </SheetClose>
              <SheetClose
                nativeButton={false}
                render={
                  <Button
                    className={cn(landingPrimaryButtonClassName, 'w-full')}
                    render={<a href={heroContent.plansHref} />}
                  />
                }
              >
                {heroContent.primaryCta}
              </SheetClose>
            </div>
          </SheetContent>
        </Sheet>
      </div>
    </header>
  );
}
