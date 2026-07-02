import 'dotenv/config';
import { UserRole } from '../generated/prisma/client.js';
import { hashPassword } from './password.js';
import { prisma } from './prisma.js';

/**
 * Cria o primeiro SUPER_ADMIN da plataforma.
 *
 * Variáveis de ambiente necessárias:
 * - PLATFORM_ADMIN_NAME
 * - PLATFORM_ADMIN_EMAIL
 * - PLATFORM_ADMIN_PASSWORD
 *
 * Uso: npx tsx ./src/lib/seed-platform-admin.ts
 */
async function seedPlatformAdmin() {
  const name = process.env.PLATFORM_ADMIN_NAME;
  const email = process.env.PLATFORM_ADMIN_EMAIL;
  const password = process.env.PLATFORM_ADMIN_PASSWORD;

  if (!name || !email || !password) {
    console.error(
      'Defina PLATFORM_ADMIN_NAME, PLATFORM_ADMIN_EMAIL e PLATFORM_ADMIN_PASSWORD no .env',
    );
    process.exit(1);
  }

  const existing = await prisma.user.findFirst({
    where: { email, role: UserRole.SUPER_ADMIN },
  });

  if (existing) {
    console.log(`Super admin já existe: ${existing.email}`);
    return;
  }

  const hashedPassword = await hashPassword(password);

  const user = await prisma.user.create({
    data: {
      name,
      email,
      password: hashedPassword,
      role: UserRole.SUPER_ADMIN,
      clinicId: null,
      isActive: true,
    },
    select: { id: true, email: true, name: true, role: true },
  });

  console.log('Super admin criado:', user);
}

seedPlatformAdmin()
  .catch((error) => {
    console.error('Falha ao criar super admin:', error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
