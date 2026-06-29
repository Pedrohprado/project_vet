import { comparePassword } from '../lib/password.js';
import { ClinicPrismaRepository } from '../repositories/prisma/clinic-prisma-repository.js';
import { UserPrismaRepository } from '../repositories/prisma/user-prisma-repository.js';
import { HttpError } from './erros/http-error.js';
import type { LoginInput } from '../https/schemas/login-schema.js';

const userRepository = new UserPrismaRepository();
const clinicRepository = new ClinicPrismaRepository();

export class LoginService {
  async execute(input: LoginInput) {
    const user = await userRepository.findByEmail(input.email);

    if (!user) {
      throw new HttpError('Credenciais inválidas', 401);
    }

    const passwordMatch = await comparePassword(input.password, user.password);

    if (!passwordMatch) {
      throw new HttpError('Credenciais inválidas', 401);
    }

    if (!user.isActive) {
      throw new HttpError('Usuário inativo', 401);
    }

    const clinic = await clinicRepository.findById(user.clinicId);

    if (!clinic?.isActive) {
      throw new HttpError('Clínica inativa', 401);
    }

    const { password: _, ...safeUser } = user;

    return { user: safeUser, clinic };
  }
}
