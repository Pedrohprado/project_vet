import { Instagram, Linkedin, MessageCircle } from 'lucide-react';
import { BrandLogo } from '@/components/brand/brand-logo';
import { navLinks } from '@/lib/landing-content';

const footerLinks = [
  { label: 'Contato', href: '#' },
  { label: 'Política', href: '#' },
  { label: 'Termos', href: '#' },
] as const;

const socialLinks = [
  { label: 'Instagram', href: '#', icon: Instagram },
  { label: 'LinkedIn', href: '#', icon: Linkedin },
  { label: 'WhatsApp', href: '#', icon: MessageCircle },
] as const;

export function LandingFooter() {
  return (
    <footer className="border-t border-border/50 bg-white">
      <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6 sm:py-12">
        <div className="grid gap-10 sm:grid-cols-2 lg:grid-cols-4">
          <div className="sm:col-span-2 lg:col-span-1">
            <div className="flex items-center gap-2">
              <BrandLogo size="sm" />
              <span className="text-lg font-bold tracking-tight text-primary">
                boxvet.
              </span>
            </div>
            <p className="mt-3 text-sm text-foreground/65">
              BoxVet — relacionamento com tutores, pós-consulta e continuidade do
              cuidado sem complicação.
            </p>
          </div>

          <div>
            <h3 className="text-sm font-semibold">Links</h3>
            <ul className="mt-4 space-y-2">
              {navLinks.map((link) => (
                <li key={link.href}>
                  <a
                    href={link.href}
                    className="text-sm text-foreground/65 transition-colors hover:text-foreground"
                  >
                    {link.label}
                  </a>
                </li>
              ))}
              {footerLinks.map((link) => (
                <li key={link.label}>
                  <a
                    href={link.href}
                    className="text-sm text-foreground/65 transition-colors hover:text-foreground"
                  >
                    {link.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h3 className="text-sm font-semibold">Redes</h3>
            <ul className="mt-4 space-y-2">
              {socialLinks.map(({ label, href, icon: Icon }) => (
                <li key={label}>
                  <a
                    href={href}
                    className="inline-flex items-center gap-2 text-sm text-foreground/65 transition-colors hover:text-foreground"
                  >
                    <Icon className="size-4" />
                    {label}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h3 className="text-sm font-semibold">Comece agora</h3>
            <p className="mt-4 text-sm text-foreground/65">
              Conheça os planos e entre na lista de espera.
            </p>
            <a
              href="#planos"
              className="mt-4 inline-block text-sm font-medium text-primary hover:underline"
            >
              Ver planos →
            </a>
          </div>
        </div>

        <p className="mt-8 border-t border-border/50 pt-6 text-center text-xs text-foreground/55">
          © {new Date().getFullYear()} BoxVet. Todos os direitos reservados.
        </p>
      </div>
    </footer>
  );
}
