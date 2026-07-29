/**
 * Erro de negócio previsto. O handler global converte em resposta HTTP.
 * Qualquer outro erro é tratado como falha inesperada (500) e não vaza detalhes.
 */
export class AppError extends Error {
  public readonly statusCode: number;
  public readonly detalhes?: unknown;

  constructor(message: string, statusCode = 400, detalhes?: unknown) {
    super(message);
    this.name = 'AppError';
    this.statusCode = statusCode;
    this.detalhes = detalhes;
    Error.captureStackTrace(this, this.constructor);
  }

  static naoEncontrado(recurso: string): AppError {
    return new AppError(`${recurso} não encontrado.`, 404);
  }

  static naoAutorizado(mensagem = 'Não autorizado.'): AppError {
    return new AppError(mensagem, 401);
  }

  static proibido(mensagem = 'Você não tem permissão para esta ação.'): AppError {
    return new AppError(mensagem, 403);
  }

  static conflito(mensagem: string): AppError {
    return new AppError(mensagem, 409);
  }
}
