const FUSO = "America/Sao_Paulo";

/** Mês em que estamos agora ("2026-10"), no fuso de Brasília */
export function mesAtual(): string {
  return new Intl.DateTimeFormat("sv-SE", { timeZone: FUSO }).format(new Date()).slice(0, 7);
}

/** Mês de uma sessão. A data é guardada como AAAA-MM-DD (meia-noite UTC), então lemos em UTC */
export function mesDaSessao(data: Date | string): string {
  return new Date(data).toISOString().slice(0, 7);
}

/** Intervalo [início, fim) do mês, para usar nas consultas ao banco */
export function intervaloDoMes(chave: string) {
  const [ano, mes] = chave.split("-").map(Number);
  return {
    inicio: new Date(Date.UTC(ano, mes - 1, 1)),
    fim: new Date(Date.UTC(ano, mes, 1)),
  };
}

/** "Out 2026" */
export function rotuloMes(chave: string): string {
  const [ano, mes] = chave.split("-").map(Number);
  const curto = new Intl.DateTimeFormat("pt-BR", { month: "short", timeZone: "UTC" })
    .format(new Date(Date.UTC(ano, mes - 1, 1)))
    .replace(".", "");
  return `${curto.charAt(0).toUpperCase()}${curto.slice(1)} ${ano}`;
}

/** "outubro de 2026" */
export function rotuloMesLongo(chave: string): string {
  const [ano, mes] = chave.split("-").map(Number);
  return new Intl.DateTimeFormat("pt-BR", { month: "long", year: "numeric", timeZone: "UTC" }).format(
    new Date(Date.UTC(ano, mes - 1, 1)),
  );
}

/** Agrupa por mês (mais recente primeiro) e sempre inclui o mês atual, mesmo sem sessões */
export function agruparPorMes<T extends { sessionDate: Date | string }>(itens: T[]) {
  const mapa = new Map<string, T[]>();
  for (const item of itens) {
    const chave = mesDaSessao(item.sessionDate);
    mapa.set(chave, [...(mapa.get(chave) ?? []), item]);
  }
  const atual = mesAtual();
  if (!mapa.has(atual)) mapa.set(atual, []);

  return Array.from(mapa.entries())
    .sort(([a], [b]) => (a < b ? 1 : -1))
    .map(([chave, items]) => ({ chave, rotulo: rotuloMes(chave), items }));
}