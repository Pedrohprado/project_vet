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
      <div className="mx-auto max-w-6xl px-4 py-12 sm:px-6">
        <div className="grid gap-10 sm:grid-cols-2 lg:grid-cols-4">
          <div className="sm:col-span-2 lg:col-span-1">
            <BrandLogo size="sm" showName />
            <p className="mt-3 text-sm text-muted-foreground">
              Relacionamento com tutores, pós-consulta automático e fidelização
              sem complicação.
            </p>
          </div>

          <div>
            <h3 className="text-sm font-semibold">Links</h3>
            <ul className="mt-4 space-y-2">
              {navLinks.map((link) => (
                <li key={link.href}>
                  <a
                    href={link.href}
                    className="text-sm text-muted-foreground transition-colors hover:text-foreground"
                  >
                    {link.label}
                  </a>
                </li>
              ))}
              {footerLinks.map((link) => (
                <li key={link.label}>
                  <a
                    href={link.href}
                    className="text-sm text-muted-foreground transition-colors hover:text-foreground"
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
                    className="inline-flex items-center gap-2 text-sm text-muted-foreground transition-colors hover:text-foreground"
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
            <p className="mt-4 text-sm text-muted-foreground">
              Conheça os planos e escolha o ideal para sua clínica.
            </p>
            <a
              href="#planos"
              className="mt-4 inline-block text-sm font-medium text-primary hover:underline"
            >
              Ver planos →
            </a>
          </div>
        </div>

        <p className="mt-10 border-t border-border/50 pt-6 text-center text-xs text-muted-foreground">
          © {new Date().getFullYear()} BoxVet. Todos os direitos reservados.
        </p>
      </div>
    </footer>
  );
}
