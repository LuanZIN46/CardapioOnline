import bcrypt from 'bcryptjs';

const SALT_ROUNDS = 10;

export function gerarHash(senha: string): Promise<string> {
  return bcrypt.hash(senha, SALT_ROUNDS);
}

export function conferirSenha(senha: string, hash: string): Promise<boolean> {
  return bcrypt.compare(senha, hash);
}
