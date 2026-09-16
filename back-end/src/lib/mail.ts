import nodemailer from 'nodemailer';

function requireEnv(name: string): string {
  const value = process.env[name]?.trim();
  if (!value) {
    throw new Error(`Variável de ambiente ${name} não configurada`);
  }
  return value;
}

export function createMailTransporter() {
  const host = process.env.SMTP_HOST?.trim() || 'smtp.hostinger.com';
  const port = Number(process.env.SMTP_PORT ?? 587);
  const user = requireEnv('SMTP_USER');
  const pass = requireEnv('SMTP_PASS');
  const secure = port === 465;

  return nodemailer.createTransport({
    host,
    port,
    secure,
    requireTLS: !secure,
    auth: { user, pass },
    connectionTimeout: 20_000,
    greetingTimeout: 20_000,
    socketTimeout: 30_000,
  });
}

let transporter: ReturnType<typeof createMailTransporter> | null = null;

export function getMailTransporter() {
  if (!transporter) {
    transporter = createMailTransporter();
  }
  return transporter;
}

export function getMailFrom() {
  const from = process.env.SMTP_FROM?.trim() || requireEnv('SMTP_USER');
  const name = process.env.MAIL_FROM_NAME?.trim() || 'BoxVet';
  return `"${name}" <${from}>`;
}
