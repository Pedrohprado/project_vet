import type { LucideIcon } from 'lucide-react';
import {
  Building2,
  Calendar,
  CalendarX,
  ClipboardList,
  GraduationCap,
  Heart,
  HeartOff,
  Home,
  MessageCircle,
  Pill,
  Smartphone,
  Sparkles,
  Star,
  Stethoscope,
  Syringe,
  TrendingUp,
  Users,
} from 'lucide-react';

export const heroContent = {
  title: 'O atendimento não termina quando a consulta acaba.',
  subtitle:
    'A BoxVet ajuda médicos veterinários a organizar consultas, vacinação e manter contato automático com os tutores, criando uma experiência que faz seus clientes voltarem.',
  primaryCta: 'Começar gratuitamente',
  secondaryCta: 'Ver demonstração',
};

export const metrics = [
  { end: 500, prefix: '+', suffix: '', localeFormat: false, label: 'Consultas realizadas' },
  { end: 1200, prefix: '+', suffix: '', localeFormat: true, label: 'Pets cadastrados' },
  { end: 98, prefix: '', suffix: '%', localeFormat: false, label: 'Tutores retornam' },
  { end: 24, prefix: '', suffix: 'h', localeFormat: false, label: 'Economizadas por mês' },
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
      title: 'Consultas espalhadas no WhatsApp',
    },
    solution: {
      icon: Calendar,
      title: 'Consultas organizadas na plataforma',
    },
    offsetY: '-12px',
  },
  {
    problem: {
      icon: Syringe,
      title: 'Vacinas esquecidas',
    },
    solution: {
      icon: Syringe,
      title: 'Lembretes de vacinação automáticos',
    },
    offsetY: '8px',
  },
  {
    problem: {
      icon: CalendarX,
      title: 'Retornos perdidos',
    },
    solution: {
      icon: Calendar,
      title: 'Lembretes de retorno',
    },
    offsetY: '-4px',
  },
  {
    problem: {
      icon: HeartOff,
      title: 'Pouco relacionamento após a consulta',
    },
    solution: {
      icon: Sparkles,
      title: 'Pós-consulta automático',
    },
    offsetY: '12px',
  },
] as const;

export const features = [
  {
    icon: Users,
    title: 'Cadastro de Tutores',
    description: 'Organize todos os responsáveis.',
  },
  {
    icon: ClipboardList,
    title: 'Histórico do Pet',
    description: 'Nunca perca informações importantes.',
  },
  {
    icon: Calendar,
    title: 'Agenda Inteligente',
    description: 'Consultas, vacinas e retornos.',
  },
  {
    icon: Stethoscope,
    title: 'Anamnese Digital',
    description: 'Registre toda a consulta.',
  },
  {
    icon: Pill,
    title: 'Receitas',
    description: 'Medicamentos organizados.',
  },
  {
    icon: Sparkles,
    title: 'Pós-consulta',
    description: 'Envie automaticamente orientações ao tutor.',
  },
] as const;

export const differentialContent = {
  title: 'Seu atendimento continua mesmo depois da consulta.',
  items: [
    { icon: Smartphone, title: 'Mensagem pós-consulta' },
    { icon: Syringe, title: 'Lembrete de vacinação' },
    { icon: Calendar, title: 'Lembrete de retorno' },
    { icon: Heart, title: 'Mais proximidade com o tutor' },
    { icon: Star, title: 'Mais fidelização' },
    { icon: TrendingUp, title: 'Mais retornos para sua clínica' },
  ] as const,
};

export const demoSlides = [
  { id: 'dashboard', label: 'Dashboard', variant: 'dashboard' as const },
  { id: 'tutor', label: 'Cadastro Tutor', variant: 'tutor' as const },
  { id: 'consultation', label: 'Consulta', variant: 'consultation' as const },
  { id: 'message', label: 'Mensagem enviada', variant: 'message' as const },
];

export const audienceItems = [
  { icon: GraduationCap, title: 'Veterinários recém-formados' },
  { icon: Building2, title: 'Clínicas pequenas' },
  { icon: Home, title: 'Atendimento domiciliar' },
  { icon: Syringe, title: 'Clínicas de vacinação' },
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
] as const;

export type ComparisonCell =
  | { type: 'yes' }
  | { type: 'no' }
  | { type: 'partial' }
  | { type: 'text'; value: string };

export const comparisonRows: {
  feature: string;
  boxvet: ComparisonCell;
  erp: ComparisonCell;
}[] = [
  { feature: 'Fácil de usar', boxvet: { type: 'yes' }, erp: { type: 'no' } },
  { feature: 'Pós-consulta', boxvet: { type: 'yes' }, erp: { type: 'no' } },
  {
    feature: 'Lembretes automáticos',
    boxvet: { type: 'yes' },
    erp: { type: 'partial' },
  },
  { feature: 'CRM para tutores', boxvet: { type: 'yes' }, erp: { type: 'no' } },
  {
    feature: 'Curva de aprendizado',
    boxvet: { type: 'text', value: 'Baixa' },
    erp: { type: 'text', value: 'Alta' },
  },
];

export const pricingPlans = [
  {
    name: 'Inicial',
    price: 'Em breve',
    description: 'Ideal para começar a organizar sua clínica.',
    features: [
      '1 Veterinário',
      'Agenda',
      'Consultas',
      'Vacinas',
      'Até 50 Pets',
    ],
    highlighted: false,
  },
  {
    name: 'Profissional',
    price: 'Em breve',
    description: 'Para clínicas que querem fidelizar tutores.',
    features: [
      'Tudo do Inicial',
      'Notificações',
      'Pós-consulta',
      'Lembretes',
      'Mais armazenamento',
    ],
    highlighted: true,
  },
] as const;

export const faqItems = [
  {
    question: 'O sistema funciona pelo celular?',
    answer: 'Sim. A BoxVet funciona no navegador do celular, tablet e computador.',
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
    question: 'Posso cancelar quando quiser?',
    answer: 'Sempre. Você pode cancelar sua assinatura a qualquer momento.',
  },
] as const;

export const ctaContent = {
  title: 'Pronto para transformar o atendimento da sua clínica?',
  button: 'Começar gratuitamente',
};

export const navLinks = [
  { label: 'Recursos', href: '#recursos' },
  { label: 'Como funciona', href: '#como-funciona' },
  { label: 'Planos', href: '#planos' },
  { label: 'FAQ', href: '#faq' },
] as const;

export type FeatureItem = {
  icon: LucideIcon;
  title: string;
  description?: string;
};
