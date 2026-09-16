import type { LucideIcon } from 'lucide-react';
import {
  Calendar,
  CalendarX,
  Heart,
  HeartOff,
  MessageCircle,
  Lightbulb,
  MessagesSquare,
  PawPrint,
  Bell,
  Pill,
  Sparkles,
  Stethoscope,
  Syringe,
} from 'lucide-react';

export const heroContent = {
  eyebrow: 'Software para clínicas veterinárias',
  title: 'BoxVet: continue cuidando do paciente mesmo depois da consulta.',
  subtitle:
    'Organize consultas, automatize retornos, vacinação e acompanhamento pós-consulta para manter tutores próximos e pacientes com o cuidado em dia.',
  primaryCta: 'Ver como funciona',
  secondaryCta: 'Conhecer os planos',
  howItWorksHref: '#como-funciona',
  plansHref: '#planos',
  trustLine: 'Feito para clínicas que querem cuidar além da consulta.',
};

export const navCtaContent = {
  label: 'Conhecer os planos',
  href: '#planos',
};

/** TODO: inserir métricas reais antes da publicação. */
export const metrics = [
  {
    end: null as number | null,
    prefix: '',
    suffix: '',
    localeFormat: false,
    label: 'Consultas realizadas',
    placeholder: '—',
  },
  {
    end: null as number | null,
    prefix: '',
    suffix: '',
    localeFormat: true,
    label: 'Pets acompanhados',
    placeholder: '—',
  },
  {
    end: null as number | null,
    prefix: '',
    suffix: '',
    localeFormat: false,
    label: 'Taxa de acompanhamento',
    placeholder: '—',
  },
  {
    end: null as number | null,
    prefix: '',
    suffix: '',
    localeFormat: false,
    label: 'Tempo economizado',
    placeholder: '—',
  },
] as const;

export const problemContent = {
  title: 'Depois da consulta, começa outra parte do cuidado.',
  subtitle:
    'Retornos para lembrar, vacinas para acompanhar, mensagens no WhatsApp e tutores esperando orientação. Quando tudo depende da equipe lembrar manualmente, pacientes acabam ficando sem acompanhamento.',
  items: [
    {
      icon: MessageCircle,
      title: 'Mensagens perdidas no WhatsApp',
    },
    {
      icon: Syringe,
      title: 'Vacinas esquecidas',
    },
    {
      icon: CalendarX,
      title: 'Retornos não agendados',
    },
    {
      icon: HeartOff,
      title: 'Tutor sem acompanhamento',
    },
  ] as const,
};

export const howItWorksContent = {
  title: 'Você atende. A BoxVet cuida do que vem depois.',
  subtitle:
    'As informações da consulta viram lembretes, acompanhamentos e próximas ações para sua equipe e para o tutor.',
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

export type FeatureItem = {
  icon: LucideIcon;
  title: string;
  description?: string;
};

export const featureGroups = [
  {
    id: 'before',
    title: 'Antes da consulta',
    highlighted: false,
    features: [
      {
        icon: PawPrint,
        title: 'Tutores e pets organizados',
        description: 'Responsáveis e histórico de cada pet no mesmo lugar.',
      },
      {
        icon: Calendar,
        title: 'Agenda de consultas e vacinas',
        description: 'Consultas, vacinas e retornos organizados.',
      },
    ],
  },
  {
    id: 'during',
    title: 'Durante a consulta',
    highlighted: false,
    features: [
      {
        icon: Stethoscope,
        title: 'Anamnese digital',
        description: 'Registre toda a consulta.',
      },
      {
        icon: Pill,
        title: 'Receitas e orientações',
        description: 'Medicamentos e orientações organizados.',
      },
    ],
  },
  {
    id: 'after',
    title: 'Depois da consulta',
    highlighted: true,
    features: [
      {
        icon: Sparkles,
        title: 'Pós-consulta automático',
        description: 'Envie orientações ao tutor automaticamente.',
      },
      {
        icon: Bell,
        title: 'Lembretes de retorno',
        description: 'Retornos e vacinas sem esquecimentos.',
      },
      {
        icon: Syringe,
        title: 'Vacinação e acompanhamento',
        description: 'Acompanhe doses e próximas vacinas de cada pet.',
      },
    ],
  },
] as const;

export const productInActionContent = {
  title: 'Do atendimento ao próximo retorno, tudo conectado.',
  subtitle:
    'Uma jornada simples que conecta consulta, orientação e retorno — sem depender de planilhas ou mensagens soltas.',
  steps: [
    {
      title: 'Consulta registrada',
      description: 'Anamnese, receitas e conduta ficam no prontuário digital.',
    },
    {
      title: 'Orientação enviada',
      description: 'A clínica revisa e envia o resumo pós-consulta ao tutor.',
    },
    {
      title: 'Lembrete programado',
      description: 'Retornos e vacinas entram na agenda com lembretes.',
    },
    {
      title: 'Tutor recebe acompanhamento',
      description: 'O tutor acompanha orientações e próximos passos.',
    },
    {
      title: 'Retorno organizado',
      description: 'A equipe sabe quando e por que o paciente deve voltar.',
    },
  ],
};

/** PLACEHOLDER: substituir por depoimentos reais antes da publicação. */
export const testimonials = [
  {
    quote: 'Finalmente um sistema que não é complicado.',
    name: 'Fernanda',
    role: 'Médica Veterinária',
    clinic: 'Clínica placeholder',
    city: 'Cidade placeholder',
    avatarInitials: 'F',
  },
  {
    quote: 'Os lembretes de vacinação diminuíram muito as faltas.',
    name: 'Bruno',
    role: 'Veterinário',
    clinic: 'Clínica placeholder',
    city: 'Cidade placeholder',
    avatarInitials: 'B',
  },
  {
    quote: 'O pós-consulta impressiona os clientes.',
    name: 'Carolina',
    role: 'Clínica Pet',
    clinic: 'Clínica placeholder',
    city: 'Cidade placeholder',
    avatarInitials: 'C',
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

export const pricingContent = {
  title: 'Planos',
  subtitle: 'Escolha a opção que combina com o momento da sua clínica.',
  cta: 'Entrar na lista de espera',
};

export const communityRoadmapContent = {
  title: 'Feito com a comunidade, em público',
  subtitle:
    'Veterinários trocam casos reais e acompanham o que entra no produto.',
  items: [
    {
      icon: MessagesSquare,
      title: 'Comunidade de casos',
      description:
        'Compartilhe atendimentos anonimizados, curta e comente.',
      highlights: [
        'Casos clínicos anonimizados',
        'Curtidas e comentários',
        'Troca entre veterinários',
      ],
    },
    {
      icon: Lightbulb,
      title: 'Roadmap público',
      description:
        'Construímos em público. Envie uma ideia e acompanhe o andamento.',
      highlights: [
        'Sugestões da comunidade',
        'Fila, andamento e concluído',
        'Você influencia o produto',
      ],
    },
  ],
} as const;

export const migrationContent = {
  title: 'Migração sem dor de cabeça',
  subtitle:
    'Saindo de um sistema antigo? Ajudamos sua clínica na transferência de dados e em todo o processo de mudança para o BoxVet.',
  steps: [
    { title: 'Envie seus dados' },
    { title: 'Nós fazemos a importação' },
    { title: 'Conferimos o histórico' },
    { title: 'Sua equipe começa a usar' },
  ],
  benefits: [
    'Histórico preservado',
    'Suporte dedicado',
    'Transição assistida',
  ],
} as const;

export const faqItems = [
  {
    question: 'Preciso trocar meu sistema atual?',
    answer:
      'Não necessariamente. A BoxVet pode ser adotada gradualmente. Se quiser migrar, ajudamos na transferência dos seus dados.',
  },
  {
    question: 'Vocês ajudam na migração dos meus dados?',
    answer:
      'Sim. Ajudamos na transferência de dados e em todo o processo de mudança do seu sistema antigo para o BoxVet.',
  },
  {
    question: 'Preciso instalar alguma coisa?',
    answer: 'Não. Tudo na nuvem — basta acessar pelo navegador.',
  },
  {
    question: 'O sistema funciona pelo celular?',
    answer:
      'Sim. A BoxVet funciona no navegador do celular, tablet e computador.',
  },
  {
    question: 'O tutor recebe mensagens?',
    // Resposta alinhada ao fluxo atual: revisão + WhatsApp manual
    answer:
      'Sim. Ao finalizar a consulta, a BoxVet gera um resumo pós-consulta para revisão. Sua equipe envia ao tutor pelo WhatsApp. Lembretes de retorno e vacina ficam organizados na agenda.',
  },
  {
    question: 'Consigo cadastrar e acompanhar vacinas?',
    answer:
      'Sim. Você registra vacinas e acompanha o histórico e as próximas doses de cada pet.',
  },
  {
    question: 'Minha equipe pode usar ao mesmo tempo?',
    // PENDENTE DE VALIDAÇÃO: multi-usuário por clínica ainda não documentado publicamente
    answer:
      'Estamos preparando opções para equipes. Entre em contato para saber como funciona no momento da sua clínica.',
  },
  {
    question: 'Posso cancelar quando quiser?',
    // PENDENTE DE VALIDAÇÃO: billing ainda não implementado
    answer:
      'Entre em contato conosco para entender as condições de cancelamento do seu plano.',
  },
  {
    question: 'O que é a Comunidade de casos?',
    answer:
      'É um espaço exclusivo para membros autenticados da BoxVet. Veterinários compartilham casos clínicos anonimizados (sem dados de tutor ou pet), curtem e comentam para trocar experiências com a comunidade.',
  },
  {
    question: 'O que é o Roadmap público?',
    answer:
      'É o quadro em que mostramos o que estamos construindo. Qualquer membro autenticado pode enviar uma ideia e acompanhar o que está na fila, em andamento e já entregue.',
  },
] as const;

export const ctaContent = {
  title: 'Transforme cada consulta em um relacionamento duradouro.',
  subtitle:
    'Organize o atendimento e continue presente na rotina do tutor mesmo depois que ele sai da clínica.',
  button: 'Conhecer os planos',
};

export const navLinks = [
  { label: 'Recursos', href: '#recursos' },
  { label: 'Como funciona', href: '#como-funciona' },
  { label: 'Comunidade', href: '#comunidade' },
  { label: 'Migração', href: '#migracao' },
  { label: 'Planos', href: '#planos' },
  { label: 'FAQ', href: '#faq' },
] as const;
