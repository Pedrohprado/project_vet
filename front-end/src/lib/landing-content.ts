import type { LucideIcon } from 'lucide-react';
import {
  Calendar,
  CalendarX,
  Heart,
  HeartOff,
  MessageCircle,
  MessagesSquare,
  PawPrint,
  Bell,
  Pill,
  Sparkles,
  Stethoscope,
  Syringe,
} from 'lucide-react';

export const heroContent = {
  title: 'O atendimento não termina quando a consulta acaba.',
  subtitle:
    'A BoxVet organiza consultas, vacinação e pós-consulta para que sua clínica mantenha contato com o tutor antes, durante e depois do atendimento.',
  primaryCta: 'Conhecer os planos',
  plansHref: '#planos',
};

export const metrics = [
  {
    end: 500,
    prefix: '+',
    suffix: '',
    localeFormat: false,
    label: 'Consultas realizadas',
  },
  {
    end: 1200,
    prefix: '+',
    suffix: '',
    localeFormat: true,
    label: 'Pets cadastrados',
  },
  {
    end: 98,
    prefix: '',
    suffix: '%',
    localeFormat: false,
    label: 'Tutores retornam',
  },
  {
    end: 24,
    prefix: '',
    suffix: 'h',
    localeFormat: false,
    label: 'Economizadas por mês',
  },
] as const;

export const problemContent = {
  titleLine1: 'Você cuida dos animais.',
  titleLine2: 'Nós cuidamos da experiência do tutor.',
  closing:
    'Tudo isso faz o tutor esquecer sua clínica e procurar outro veterinário.',
  items: [
    {
      icon: MessageCircle,
      title: 'Consultas espalhadas no WhatsApp',
    },
    {
      icon: Syringe,
      title: 'Vacinas esquecidas',
    },
    {
      icon: CalendarX,
      title: 'Retornos perdidos',
    },
    {
      icon: HeartOff,
      title: 'Pouco relacionamento após a consulta',
    },
  ] as const,
};

export const howItWorksContent = {
  subtitle:
    'Os problemas entram desorganizados. A BoxVet organiza e devolve soluções automáticas para sua clínica.',
};

export const howItWorksPairs = [
  {
    problem: {
      icon: MessageCircle,
      title: 'Mensagens perdidas no WhatsApp',
    },
    solution: {
      icon: Calendar,
      title: 'Consulta organizada',
    },
    offsetY: '-12px',
  },
  {
    problem: {
      icon: Syringe,
      title: 'Vacinas esquecidas',
    },
    solution: {
      icon: Bell,
      title: 'Lembrete automático',
    },
    offsetY: '8px',
  },
  {
    problem: {
      icon: CalendarX,
      title: 'Retornos não agendados',
    },
    solution: {
      icon: Sparkles,
      title: 'Pós-consulta enviado',
    },
    offsetY: '-4px',
  },
  {
    problem: {
      icon: HeartOff,
      title: 'Tutor sem acompanhamento',
    },
    solution: {
      icon: Heart,
      title: 'Tutor mais próximo da clínica',
    },
    offsetY: '12px',
  },
] as const;

export const features = [
  {
    icon: PawPrint,
    title: 'Tutores e Pets organizados',
    description: 'Responsáveis e histórico de cada pet no mesmo lugar.',
  },
  {
    icon: Calendar,
    title: 'Agenda de consultas e vacinas',
    description: 'Consultas, vacinas e retornos organizados.',
  },
  {
    icon: Sparkles,
    title: 'Pós-consulta automático',
    description: 'Envie orientações ao tutor automaticamente.',
  },
  {
    icon: Pill,
    title: 'Receitas e orientações',
    description: 'Medicamentos e orientações organizados.',
  },
  {
    icon: Stethoscope,
    title: 'Anamnese digital',
    description: 'Registre toda a consulta.',
  },
  {
    icon: Bell,
    title: 'Lembretes de retorno',
    description: 'Retornos e vacinas sem esquecimentos.',
  },
  {
    icon: MessagesSquare,
    title: 'Comunidade clínica',
    description:
      'Compartilhe casos anonimizados e troque experiências com outros veterinários da plataforma.',
  },
] as const;

export const testimonials = [
  {
    quote: 'Finalmente um sistema que não é complicado.',
    name: 'Fernanda',
    role: 'Médica Veterinária',
  },
  {
    quote: 'Os lembretes de vacinação diminuíram muito as faltas.',
    name: 'Bruno',
    role: 'Veterinário',
  },
  {
    quote: 'O pós-consulta impressiona os clientes.',
    name: 'Carolina',
    role: 'Clínica Pet',
  },
  {
    quote: 'A agenda ficou organizada e a equipe alinhada.',
    name: 'Marcos',
    role: 'Dono de Clínica',
  },
  {
    quote: 'Os tutores adoram acompanhar o histórico pelo celular.',
    name: 'Juliana',
    role: 'Recepção',
  },
  {
    quote: 'Prontuário digital sem papelada nem planilha.',
    name: 'Ricardo',
    role: 'Médico Veterinário',
  },
  {
    quote: 'Em uma tarde já estávamos usando no dia a dia.',
    name: 'Patrícia',
    role: 'Gestora de Clínica',
  },
  {
    quote: 'O peso e as vacinas ficam registrados sem esforço.',
    name: 'André',
    role: 'Veterinário',
  },
  {
    quote: 'Menos ligações cobrando retorno. Mais tempo no consultório.',
    name: 'Camila',
    role: 'Médica Veterinária',
  },
  {
    quote: 'Simples de ensinar para a equipe toda.',
    name: 'Thiago',
    role: 'Sócio da Clínica',
  },
] as const;

export const pricingPlans = [
  {
    name: 'Starter',
    price: 'Em breve',
    description: 'Para veterinários começando.',
    features: [
      '1 Veterinário',
      'Agenda',
      'Consultas',
      'Vacinas',
      'Comunidade de casos',
      'Até 50 Pets',
    ],
    highlighted: false,
  },
  {
    name: 'Pro',
    price: 'Em breve',
    description: 'Para clínicas em crescimento.',
    features: [
      'Tudo do Starter',
      'Notificações',
      'Pós-consulta',
      'Lembretes',
      'Comunidade de casos',
      'Mais armazenamento',
    ],
    highlighted: true,
  },
] as const;

export const migrationContent = {
  title: 'Migração sem dor de cabeça',
  subtitle:
    'Saindo de um sistema antigo? Ajudamos sua clínica na transferência de dados e em todo o processo de mudança para o BoxVet.',
  badges: [
    'Importação de dados',
    'Transição assistida',
    'Histórico preservado',
    'Suporte dedicado',
    'Comece com tranquilidade',
  ],
} as const;

export const faqItems = [
  {
    question: 'O sistema funciona pelo celular?',
    answer:
      'Sim. A BoxVet funciona no navegador do celular, tablet e computador.',
  },
  {
    question: 'Preciso instalar algo?',
    answer: 'Não. Tudo na nuvem — basta acessar pelo navegador.',
  },
  {
    question: 'Consigo cadastrar vacinas?',
    answer: 'Sim. Você registra vacinas e acompanha o histórico de cada pet.',
  },
  {
    question: 'O tutor recebe mensagens?',
    answer:
      'Sim. A BoxVet envia lembretes e mensagens pós-consulta automaticamente.',
  },
  {
    question: 'O que é a Comunidade de casos?',
    answer:
      'É um espaço exclusivo para membros autenticados da BoxVet. Veterinários compartilham casos clínicos anonimizados (sem dados de tutor ou pet), curtem e comentam para trocar experiências com a comunidade.',
  },
  {
    question: 'Posso cancelar quando quiser?',
    answer: 'Sempre. Você pode cancelar sua assinatura a qualquer momento.',
  },
  {
    question: 'Vocês ajudam na migração do meu sistema atual?',
    answer:
      'Sim. Ajudamos na transferência de dados e em todo o processo de mudança do seu sistema antigo para o BoxVet.',
  },
] as const;

export const ctaContent = {
  title: 'Comece a transformar cada consulta em um relacionamento duradouro.',
  button: 'Conhecer os planos',
};

export const navLinks = [
  { label: 'Recursos', href: '#recursos' },
  { label: 'Como funciona', href: '#como-funciona' },
  { label: 'Migração', href: '#migracao' },
  { label: 'Planos', href: '#planos' },
  { label: 'FAQ', href: '#faq' },
] as const;

export type FeatureItem = {
  icon: LucideIcon;
  title: string;
  description?: string;
};
