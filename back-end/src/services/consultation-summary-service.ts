import { ChatGroq } from '@langchain/groq';
import { HumanMessage, SystemMessage } from '@langchain/core/messages';
import { env } from '../env/index.js';
import { HttpError } from './erros/http-error.js';

export type ConsultationSummaryContext = {
  tutorName: string;
  petName: string;
  petSpecies: string;
  veterinarianName: string;
  diagnosis?: string | null;
  conduct?: string | null;
  mainComplaint?: string | null;
  needsReturn: boolean;
  returnDate?: Date | string | null;
  prescriptions: Array<{
    medicineName: string;
    dosage?: string | null;
    frequency?: string | null;
    duration?: string | null;
    instructions?: string | null;
  }>;
};

const SPECIES_EMOJI: Record<string, string> = {
  DOG: '🐶',
  CAT: '🐱',
  BIRD: '🐦',
  RABBIT: '🐰',
  RODENT: '🐹',
  FERRET: '🦦',
  REPTILE: '🦎',
  FISH: '🐟',
  OTHER: '🐾',
};

export function petSpeciesEmoji(species: string | null | undefined): string {
  if (!species) return '🐾';
  return SPECIES_EMOJI[species] ?? '🐾';
}

const SYSTEM_PROMPT = `Você escreve mensagens de pós-consulta veterinária para WhatsApp, em português do Brasil.

Formatação (obrigatória):
- Use quebras de linha e uma linha em branco entre cada bloco (saudação, diagnóstico, conduta, receitas, retorno, despedida, assinatura).
- Nunca escreva tudo em um único parágrafo.
- Não use markdown, asteriscos, hashtags nem bullets com símbolos especiais.
- Em receitas, use uma linha por medicamento, com dose/frequência/duração/instruções quando existirem.

Emojis:
- Sempre coloque o emoji da espécie do pet logo após o nome do animal (ex.: "Ronyy 🐶"), usando o emoji indicado no contexto.
- Use poucos emojis na despedida (ex.: 💛 😊), sem exagerar.

Conteúdo:
- Tom acolhedor, claro, humano e profissional.
- Mensagem curta e legível no celular (idealmente até ~1200 caracteres).
- Use APENAS as informações do contexto. Nunca invente diagnóstico, conduta, medicamento, dose ou retorno.
- Se um campo estiver ausente no contexto, omita essa parte sem comentar a ausência.
- Sobre retorno: só mencione retorno se o contexto indicar "Tem retorno agendado: sim" e houver data. Se estiver "não", NÃO fale de retorno, remarcação nem "aguardamos vocês no retorno".
- Antes do "Atenciosamente", inclua uma despedida humanizada, no espírito de: "Espero que ele/ela fique bem 💛 Qualquer coisa, estou à disposição! 😊" (adapte o gênero ao pet quando fizer sentido).
- Inclua o nome do veterinário no final.

Estrutura sugerida:

Olá {tutor}!

Obrigado por trazer o(a) {pet} {emoji} para a consulta.

Diagnóstico:
{texto}

Conduta:
{texto}

Receitas:
{medicamento} — {dose}, {frequência}, {duração}
Instruções: {texto}

Retorno agendado para {data/hora}.

Espero que ele/ela fique bem 💛
Qualquer coisa, estou à disposição! 😊

Atenciosamente,
{veterinário}

Responda somente com o texto final da mensagem, sem explicações.`;

function formatReturnDate(returnDate: Date | string | null | undefined): string | null {
  if (!returnDate) return null;
  const date = returnDate instanceof Date ? returnDate : new Date(returnDate);
  if (Number.isNaN(date.getTime())) return null;
  return date.toLocaleString('pt-BR', {
    dateStyle: 'short',
    timeStyle: 'short',
  });
}

function buildContextText(context: ConsultationSummaryContext): string {
  const emoji = petSpeciesEmoji(context.petSpecies);
  const lines = [
    `Tutor: ${context.tutorName}`,
    `Pet: ${context.petName}`,
    `Espécie: ${context.petSpecies}`,
    `Emoji da espécie (obrigatório após o nome do pet): ${emoji}`,
    `Veterinário: ${context.veterinarianName}`,
  ];

  if (context.mainComplaint?.trim()) {
    lines.push(`Queixa principal: ${context.mainComplaint.trim()}`);
  }
  if (context.diagnosis?.trim()) {
    lines.push(`Diagnóstico: ${context.diagnosis.trim()}`);
  }
  if (context.conduct?.trim()) {
    lines.push(`Conduta: ${context.conduct.trim()}`);
  }

  const returnDate =
    context.needsReturn ? formatReturnDate(context.returnDate) : null;

  if (returnDate) {
    lines.push('Tem retorno agendado: sim');
    lines.push(`Data/hora do retorno: ${returnDate}`);
  } else {
    lines.push('Tem retorno agendado: não');
    lines.push('Não mencione retorno na mensagem.');
  }

  if (context.prescriptions.length > 0) {
    lines.push('Receitas:');
    for (const prescription of context.prescriptions) {
      const details: string[] = [];
      if (prescription.dosage?.trim()) {
        details.push(`dose ${prescription.dosage.trim()}`);
      }
      if (prescription.frequency?.trim()) {
        details.push(`frequência ${prescription.frequency.trim()}`);
      }
      if (prescription.duration?.trim()) {
        details.push(`duração ${prescription.duration.trim()}`);
      }
      if (prescription.instructions?.trim()) {
        details.push(`instruções ${prescription.instructions.trim()}`);
      }
      lines.push(
        details.length > 0
          ? `- ${prescription.medicineName}: ${details.join('; ')}`
          : `- ${prescription.medicineName}`,
      );
    }
  }

  return lines.join('\n');
}

export class ConsultationSummaryService {
  async generatePostConsultationMessage(
    context: ConsultationSummaryContext,
  ): Promise<string> {
    const model = new ChatGroq({
      apiKey: env.GROQ_API_KEY,
      model: 'llama-3.3-70b-versatile',
      temperature: 0.3,
    });

    try {
      const response = await model.invoke([
        new SystemMessage(SYSTEM_PROMPT),
        new HumanMessage(
          `Gere a mensagem de pós-consulta com base neste contexto:\n\n${buildContextText(context)}`,
        ),
      ]);

      const content = response.content;
      const text =
        typeof content === 'string'
          ? content
          : Array.isArray(content)
            ? content
                .map((part) =>
                  typeof part === 'string'
                    ? part
                    : 'text' in part
                      ? String(part.text)
                      : '',
                )
                .join('')
            : String(content ?? '');

      const message = text.trim();
      if (!message) {
        throw new HttpError('A IA não retornou um resumo válido', 502);
      }

      return message;
    } catch (error) {
      if (error instanceof HttpError) throw error;
      throw new HttpError(
        'Não foi possível gerar o resumo com IA. Tente novamente.',
        502,
      );
    }
  }
}
