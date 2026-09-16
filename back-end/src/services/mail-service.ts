import { getMailFrom, getMailTransporter } from '../lib/mail.js';

export class MailService {
  async sendPasswordResetCode(input: {
    to: string;
    name: string;
    code: string;
  }) {
    const transporter = getMailTransporter();
    const subject = 'Código para redefinir sua senha — BoxVet';
    const text = [
      `Olá, ${input.name}!`,
      '',
      `Seu código para redefinir a senha é: ${input.code}`,
      '',
      'Ele vale por 15 minutos. Se você não solicitou, ignore este e-mail.',
      '',
      '— Equipe BoxVet',
    ].join('\n');

    const html = `
      <div style="font-family: system-ui, sans-serif; max-width: 480px; margin: 0 auto; color: #1a1a1a;">
        <p>Olá, <strong>${escapeHtml(input.name)}</strong>!</p>
        <p>Use o código abaixo para redefinir sua senha no BoxVet:</p>
        <p style="font-size: 28px; letter-spacing: 6px; font-weight: 700; text-align: center; margin: 24px 0;">
          ${escapeHtml(input.code)}
        </p>
        <p style="color: #666; font-size: 14px;">
          O código vale por <strong>15 minutos</strong>. Se você não solicitou esta alteração, ignore este e-mail.
        </p>
        <p style="color: #666; font-size: 14px;">— Equipe BoxVet</p>
      </div>
    `;

    await transporter.sendMail({
      from: getMailFrom(),
      to: input.to,
      subject,
      text,
      html,
    });
  }
}

function escapeHtml(value: string) {
  return value
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;');
}
