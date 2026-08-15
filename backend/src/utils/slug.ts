/** Converte um nome em identificador de URL: "Bar do Pardal" -> "bar-do-pardal". */
export function gerarSlug(texto: string): string {
  return texto
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 60);
}

/**
 * Garante um slug livre acrescentando sufixo numérico quando já existir.
 * `existe` consulta o banco — fica de fora daqui para a função seguir pura.
 */
export async function slugDisponivel(
  base: string,
  existe: (candidato: string) => Promise<boolean>,
): Promise<string> {
  const raiz = gerarSlug(base) || 'empresa';

  if (!(await existe(raiz))) return raiz;

  for (let sufixo = 2; sufixo <= 50; sufixo += 1) {
    const candidato = `${raiz}-${sufixo}`;
    if (!(await existe(candidato))) return candidato;
  }

  return `${raiz}-${Date.now().toString(36)}`;
}
