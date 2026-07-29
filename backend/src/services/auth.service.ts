import { prisma } from '../config/prisma.js';
import { AppError } from '../utils/AppError.js';
import { gerarToken } from '../utils/jwt.js';
import { conferirSenha, gerarHash } from '../utils/senha.js';
import type { Plano } from '../generated/prisma/enums.js';

interface DadosRegistro {
  empresa: { nome: string; telefone: string; email: string; plano?: Plano };
  usuario: { nome: string; email: string; senha: string };
}

interface DadosLogin {
  email: string;
  senha: string;
}

const usuarioPublico = {
  id: true,
  nome: true,
  email: true,
  cargo: true,
  empresaId: true,
} as const;

/**
 * Cria a empresa e seu primeiro usuário (sempre ADMIN) numa única transação:
 * uma empresa nunca deve existir sem alguém que consiga acessá-la.
 */
export async function registrar(dados: DadosRegistro) {
  const emailEmUso = await prisma.empresa.findUnique({
    where: { email: dados.empresa.email },
    select: { id: true },
  });

  if (emailEmUso) {
    throw AppError.conflito('Já existe uma empresa cadastrada com este e-mail.');
  }

  const senhaHash = await gerarHash(dados.usuario.senha);

  const empresa = await prisma.empresa.create({
    data: {
      nome: dados.empresa.nome,
      telefone: dados.empresa.telefone,
      email: dados.empresa.email,
      plano: dados.empresa.plano ?? 'FREE',
      usuarios: {
        create: {
          nome: dados.usuario.nome,
          email: dados.usuario.email,
          senha: senhaHash,
          cargo: 'ADMIN',
        },
      },
    },
    select: {
      id: true,
      nome: true,
      email: true,
      plano: true,
      usuarios: { select: usuarioPublico },
    },
  });

  const usuario = empresa.usuarios[0]!;

  return {
    token: gerarToken({ sub: usuario.id, empresaId: empresa.id, cargo: usuario.cargo }),
    usuario,
    empresa: { id: empresa.id, nome: empresa.nome, email: empresa.email, plano: empresa.plano },
  };
}

export async function login({ email, senha }: DadosLogin) {
  const usuario = await prisma.usuario.findFirst({
    where: { email, ativo: true },
    select: { ...usuarioPublico, senha: true, empresa: { select: { ativo: true, nome: true, plano: true } } },
  });

  // Mensagem única para e-mail inexistente ou senha errada: não revela quais e-mails existem.
  const credenciaisInvalidas = AppError.naoAutorizado('E-mail ou senha incorretos.');

  if (!usuario) {
    // Executa um hash falso para manter o tempo de resposta parecido com o do caminho válido.
    await conferirSenha(senha, '$2a$10$invalidinvalidinvalidinvalidinvalidinvalidinvalidinvalid');
    throw credenciaisInvalidas;
  }

  const senhaCorreta = await conferirSenha(senha, usuario.senha);
  if (!senhaCorreta) throw credenciaisInvalidas;

  if (!usuario.empresa.ativo) {
    throw AppError.proibido('Esta empresa está inativa. Fale com o suporte.');
  }

  const { senha: _senha, empresa, ...dadosPublicos } = usuario;

  return {
    token: gerarToken({
      sub: usuario.id,
      empresaId: usuario.empresaId,
      cargo: usuario.cargo,
    }),
    usuario: dadosPublicos,
    empresa: { id: usuario.empresaId, nome: empresa.nome, plano: empresa.plano },
  };
}

export async function perfil(usuarioId: string, empresaId: string) {
  const usuario = await prisma.usuario.findFirst({
    where: { id: usuarioId, empresaId },
    select: {
      ...usuarioPublico,
      empresa: { select: { id: true, nome: true, plano: true, ativo: true } },
    },
  });

  if (!usuario) throw AppError.naoEncontrado('Usuário');

  return usuario;
}
